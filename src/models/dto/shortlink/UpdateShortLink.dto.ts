import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateShortLinkDTO } from 'models/dto/shortlink/CreateShortLink.dto';

export class UpdateShortLinkDTO extends PartialType(
  OmitType(CreateShortLinkDTO, ['slug', 'domain'] as const),
) {}
