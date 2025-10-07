import { RateLimit } from 'core/decorators/RateLimit.decorator';
import { dayjs } from 'core/utils/dayjs';

import { Body, Controller, Get, Logger, Post, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { WaitlistParticipantDTO } from 'models/dto/WaitlistParticipant.dto';
import { WaitlistParticipantsCountDTO } from 'models/dto/WaitlistParticipantsCount.dto';
import { WaitlistService } from 'services/Waitlist.service';

@ApiTags('Waitlist')
@Controller('/waitlist')
export class WaitlistController {
  private readonly logger: Logger = new Logger(WaitlistController.name);

  constructor(private readonly waitlistService: WaitlistService) {}

  @Version('1')
  @RateLimit({
    limit: 1,
    ttl: dayjs.duration({ minutes: 30 }).asMilliseconds(),
  })
  @Post()
  async addToWaitlist(
    @Body() waitlistParticipant: WaitlistParticipantDTO,
  ): Promise<PositiveResponseDto> {
    this.logger.log(
      `Received Add Participant "${waitlistParticipant.email}" to Waitlist Request`,
    );

    await this.waitlistService.addParticipantToWaitlist(waitlistParticipant);

    return PositiveResponseDto.instance();
  }

  @Version('1')
  @Get('/count')
  getWaitlistCount(): Promise<WaitlistParticipantsCountDTO> {
    this.logger.log(`Received Get Waitlist Participants Count Request`);

    return this.waitlistService.getWaitlistParticipantsCount();
  }
}
