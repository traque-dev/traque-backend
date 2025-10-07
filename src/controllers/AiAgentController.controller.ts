import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { Principal } from 'core/decorators/Principal.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';
import { TraquePlus } from 'core/decorators/TraquePlus.decorator';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionAnalyzerAgent } from 'agents/ExceptionAnalyzer.agent';

import { ConversationDTO } from 'models/dto/Conversation.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { Project } from 'models/entity/Project.entity';
import { User } from 'models/entity/User.entity';

import type { Response } from 'express';

@ApiTags('AI Agents')
@Controller('/ai/agents')
export class AiAgentController {
  private readonly logger: Logger = new Logger(AiAgentController.name);

  constructor(
    private readonly exceptionAnalyzerAgent: ExceptionAnalyzerAgent,
  ) {}

  @Version('1')
  @PreAuthorize()
  @TraquePlus()
  @ProjectMemberOnly()
  @Post('/:projectId/chat')
  async chat(
    @Body() body: ConversationDTO,
    @Principal() user: User,
    @CurrentProject() project: Project,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(
      `Received chat request from user ${user.id} for project ${project.id}`,
    );

    const result = await this.exceptionAnalyzerAgent.chat(
      user,
      project,
      body.messages,
      body,
    );

    return result.pipeUIMessageStreamToResponse(res, {
      sendReasoning: true,
      sendSources: false,
      onFinish: async (event) => {
        await this.exceptionAnalyzerAgent.updateConversationMessages(
          body.threadMetadata.id,
          [...body.messages, ...event.messages],
        );
      },
    });
  }

  @Version('1')
  @PreAuthorize()
  @HttpCode(HttpStatus.OK)
  @Get('/conversations')
  getConversations(@Principal() user: User) {
    this.logger.log(`Received get conversations request from user ${user.id}`);

    return this.exceptionAnalyzerAgent.getConversations(user);
  }

  @Version('1')
  @PreAuthorize()
  @Get('/conversations/:conversationId')
  getConversation(
    @Param('conversationId') conversationId: string,
    @Principal() user: User,
  ) {
    this.logger.log(
      `Received get conversation by id request from user ${user.id} for conversation ${conversationId}`,
    );

    return this.exceptionAnalyzerAgent.getConversationById(
      user,
      conversationId,
    );
  }

  @Version('1')
  @PreAuthorize()
  @Delete('/conversations/:conversationId')
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Principal() user: User,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received delete conversation request from user ${user.id} for conversation ${conversationId}`,
    );

    await this.exceptionAnalyzerAgent.deleteConversation(user, conversationId);

    return PositiveResponseDto.instance();
  }
}
