import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignFeedbackDTO {
  @ApiProperty({ required: false, description: 'Set to null to unassign' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
