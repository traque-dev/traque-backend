import { ExtractProps } from 'core/types/ExtractProps';

import { ApiProperty } from '@nestjs/swagger';

export class WaitlistParticipantsCountDTO {
  @ApiProperty()
  count: number;

  constructor(props: ExtractProps<WaitlistParticipantsCountDTO>) {
    Object.assign(this, props);
  }
}
