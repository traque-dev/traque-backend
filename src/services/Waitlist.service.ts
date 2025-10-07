import { InternalServerErrorException } from 'core/exceptions/InternalServerError.exception';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WaitlistParticipantDTO } from 'models/dto/WaitlistParticipant.dto';
import { WaitlistParticipantsCountDTO } from 'models/dto/WaitlistParticipantsCount.dto';
import { WaitlistParticipant } from 'models/entity/WaitlistParticipant.entity';

interface IWaitlistService {
  addParticipantToWaitlist(dto: WaitlistParticipantDTO): Promise<void>;

  getWaitlistParticipantsCount(): Promise<WaitlistParticipantsCountDTO>;
}

@Injectable()
export class WaitlistService implements IWaitlistService {
  private readonly logger: Logger = new Logger(WaitlistService.name);

  constructor(
    @InjectRepository(WaitlistParticipant)
    private readonly repo: Repository<WaitlistParticipant>,
  ) {}

  async addParticipantToWaitlist({
    email,
  }: WaitlistParticipantDTO): Promise<void> {
    try {
      await this.repo.save({
        email,
      });
    } catch (error: unknown) {
      this.logger.error('Add participant to waitlist error: ', error);

      throw new InternalServerErrorException({
        message:
          "We couldn't add you to the waitlist. Perhaps your email is already on the list.",
      });
    }
  }

  async getWaitlistParticipantsCount(): Promise<WaitlistParticipantsCountDTO> {
    const count = await this.repo.count();

    return new WaitlistParticipantsCountDTO({
      count,
    });
  }
}
