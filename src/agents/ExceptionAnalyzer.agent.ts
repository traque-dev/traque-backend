import { openai } from 'core/ai/openai';
import { NotFoundException } from 'core/exceptions/NotFound.exception';
import { dayjs } from 'core/utils/dayjs';
import { dedent } from 'core/utils/dedent';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  type UIMessage,
  convertToModelMessages,
  generateObject,
  streamText,
  tool,
} from 'ai';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { z } from 'zod';

import { ConversationDTO } from 'models/dto/Conversation.dto';
import { Conversation } from 'models/entity/Conversation.entity';
import { Exception } from 'models/entity/Exception.entity';
import { Issue } from 'models/entity/Issue.entity';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';
import { ConversationMapper } from 'models/mappers/Conversation.mapper';
import { ExceptionSamplingService } from 'services/ExceptionSampling.service';
import { ExceptionStatisticService } from 'services/ExceptionStatistic.service';

type IssuesCluster = {
  issue: string;
  totalCount: number;
  sampledExceptions: string[];
};

type IssueSamples = {
  issue: Issue;
  samples: Exception[];
};

@Injectable()
export class ExceptionAnalyzerAgent {
  constructor(
    @InjectRepository(Exception)
    private readonly exceptionRepo: Repository<Exception>,
    @InjectRepository(Issue)
    private readonly issueRepo: Repository<Issue>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly conversationMapper: ConversationMapper,
    private readonly exceptionStatisticService: ExceptionStatisticService,
    private readonly exceptionSamplingService: ExceptionSamplingService,
  ) {}

  async chat(
    user: User,
    project: Project,
    messages: UIMessage[],
    params?: ConversationDTO,
  ) {
    const where: FindOptionsWhere<Issue> = {
      project: {
        id: project.id,
      },
    };

    let existingConversation = await this.conversationRepo.findOne({
      where: {
        id: params?.threadMetadata.id,
        user: {
          id: user.id,
        },
      },
    });

    let systemPrompt = '';

    if (existingConversation) {
      systemPrompt = existingConversation.systemPrompt;
    } else {
      const firstMessageText =
        messages[0].parts[0].type === 'text' ? messages[0].parts[0].text : '';

      let threadName = 'New Chat';

      try {
        const { object } = await generateObject({
          model: openai('gpt-4.1-nano'),
          schema: z.object({
            name: z.string().describe('The name of the thread'),
          }),
          prompt: `Generate a name for the conversation based on the following first user message: ${firstMessageText}. Name must be short, concise and human readable.`,
        });

        threadName = object?.name;
      } catch (error) {
        console.error(error);
      }

      const from = params?.dateFrom
        ? dayjs(params.dateFrom).toDate()
        : dayjs().startOf('day').toDate();
      const to = params?.dateTo
        ? dayjs(params.dateTo).toDate()
        : dayjs().endOf('day').toDate();
      where.lastSeen = Between(from, to);

      const currentIssues = await this.issueRepo.find({
        where,
      });

      // Build per-issue sampled exceptions with dedupe + stratification
      const perIssueRawSamples: IssueSamples[] = await Promise.all(
        currentIssues.map(async (issue) => {
          const perIssueFetch = Math.max(
            this.exceptionSamplingService.perIssueCap *
              this.exceptionSamplingService.fetchMultiplier,
            50,
          );
          const exceptions = await this.exceptionRepo.find({
            where: {
              issue: {
                id: issue.id,
              },
            },
            relations: {
              httpContext: true,
            },
            order: {
              createdAt: 'DESC',
            },
            take: perIssueFetch,
          });

          const deduped =
            this.exceptionSamplingService.dedupeExceptions(exceptions);
          const sampled = this.exceptionSamplingService.stratifiedSample(
            deduped,
            this.exceptionSamplingService.perIssueCap,
          );

          return { issue, samples: sampled };
        }),
      );

      // Enforce global cap across issues proportionally
      const samplesOnly = perIssueRawSamples.map((r) => r.samples);
      const cappedSamples =
        this.exceptionSamplingService.enforceGlobalCapByProportion(
          samplesOnly,
          this.exceptionSamplingService.globalCap,
        );

      const clusters: IssuesCluster[] = perIssueRawSamples.map((r, idx) => ({
        issue: `${r.issue.name}`,
        totalCount: r.issue.eventCount,
        sampledExceptions: cappedSamples[idx].map((ex) =>
          this.exceptionSamplingService.preprocessException(ex),
        ),
      }));

      systemPrompt = this.generateSystemPrompt(project, clusters, {
        from,
        to,
      });

      existingConversation = await this.conversationRepo.save({
        id: params?.threadMetadata.id,
        name: threadName,
        systemPrompt,
        user: {
          id: user.id,
        },
        project: {
          id: project.id,
        },
      });
    }

    await this.updateConversationMessages(existingConversation.id, messages);

    const stream = streamText({
      model: openai('gpt-5'),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools: {
        getExceptionStatistic: tool({
          description:
            'Get daily exception counts for this project between ISO dates "from" and "to".',
          inputSchema: z.object({
            from: z.iso.date(),
            to: z.iso.date(),
          }),
          execute: async ({ from, to }) => {
            const fromDate = dayjs(from).toDate();
            const toDate = dayjs(to).toDate();

            const statistic =
              await this.exceptionStatisticService.getDailyStatistic(
                project,
                fromDate,
                toDate,
              );

            return statistic;
          },
        }),
      },
      providerOptions: {
        openai: {
          reasoningEffort: 'low',
        },
      },
    });

    return stream;
  }

  async updateConversationMessages(
    conversationId: string,
    messages: UIMessage[],
  ) {
    await this.conversationRepo.update(conversationId, {
      // @ts-expect-error The expected type comes from property 'messages'
      messages,
    });
  }

  async getConversations(user: User) {
    const conversations = await this.conversationRepo.find({
      where: {
        user: {
          id: user.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return conversations.map((conversation) =>
      this.conversationMapper.toDTO(conversation),
    );
  }

  async getConversationById(user: User, conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: {
        id: conversationId,
        user: {
          id: user.id,
        },
      },
      relations: {
        project: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException({
        message: 'Conversation is not found',
      });
    }

    return this.conversationMapper
      .toDTO(conversation)
      .withMessages(conversation.messages);
  }

  async deleteConversation(user: User, conversationId: string) {
    await this.conversationRepo.delete({
      id: conversationId,
      user: {
        id: user.id,
      },
    });
  }

  private generateSystemPrompt(
    project: Project,
    clusters: IssuesCluster[],
    {
      from,
      to,
    }: {
      from: Date;
      to: Date;
    },
  ) {
    return dedent(`
      You are Traque AI, an advanced AI agent specializing in the analysis of application events, exceptions, and errors.

      Focus your analysis as an expert software engineer on identifying patterns, evaluating the business impact, and highlighting trends based on the provided data. 
      Communicate using clear, professional language suitable for both technical and non-technical stakeholders, emphasizing actionable insights over technical jargon.

      When presenting your findings:
      - Respond in the user's language when possible.
      - Keep answers short and concise.
      - Stay strictly within the scope of the provided context.

      After you complete your analysis, validate that your summary and recommendations directly address the most significant issues identified and are actionable from a business perspective; if unclear, self-correct before finalizing the output.

      Analyze the following issues contextually:
      ${clusters.map((cluster) => `<issue name="${cluster.issue}" totalCount="${cluster.totalCount}">\n${cluster.sampledExceptions.join('\n')}\n</issue>`).join('\n')}

      Additional context:
      - **Current date:** ${dayjs().format('YYYY-MM-DD')}
      - **Issue window:** ${dayjs(from).format('YYYY-MM-DD')} to ${dayjs(to).format('YYYY-MM-DD')}
      - **Project:** ${project.name} (Platform: ${project.platform})

      If no issues or exceptions exist during the period, state clearly: 'No issues or exceptions were found during the specified period.

      Format your analysis using valid **Markdown**.
    `);
  }
}
