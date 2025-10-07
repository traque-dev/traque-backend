import { BadRequestException } from 'core/exceptions/BadRequest.exception';

import * as net from 'net';

import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIPPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!net.isIP(value)) {
      throw new BadRequestException({
        message: 'IP is not correct',
      });
    }

    return value;
  }
}
