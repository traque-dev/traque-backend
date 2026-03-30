import { PartialType } from '@nestjs/swagger';

import { CreateMonitorDTO } from 'models/dto/uptime/CreateMonitor.dto';

export class UpdateMonitorDTO extends PartialType(CreateMonitorDTO) {}
