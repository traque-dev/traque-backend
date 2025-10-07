import { HttpException, HttpStatus } from '@nestjs/common';

export class ToDoException extends HttpException {
  override name: string = 'ToDoException';

  constructor(message = 'This functionality is to be implemented') {
    super(message, HttpStatus.NOT_IMPLEMENTED);
  }
}
