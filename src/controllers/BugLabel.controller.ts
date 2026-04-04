import { CurrentProject } from 'core/decorators/CurrentProject.decorator';
import { PreAuthorize } from 'core/decorators/PreAuthorize.decorator';
import { ProjectMemberOnly } from 'core/decorators/ProjectMemberOnly.decorator';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BugLabelDTO } from 'models/dto/BugLabel.dto';
import { CreateBugLabelDTO } from 'models/dto/CreateBugLabel.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { UpdateBugLabelDTO } from 'models/dto/UpdateBugLabel.dto';
import { Project } from 'models/entity/Project.entity';
import { BugLabelService } from 'services/BugLabel.service';

@ApiTags('Bug Labels')
@Controller('/organizations/:organizationId/projects/:projectId/bugs/labels')
export class BugLabelController {
  constructor(private readonly labelService: BugLabelService) {}

  @ApiOperation({ summary: 'List project bug labels' })
  @ApiResponse({ type: BugLabelDTO, isArray: true })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getLabels(@CurrentProject() project: Project): Promise<BugLabelDTO[]> {
    return this.labelService.getLabels(project);
  }

  @ApiOperation({ summary: 'Create a bug label' })
  @ApiResponse({ type: BugLabelDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  createLabel(
    @CurrentProject() project: Project,
    @Body() dto: CreateBugLabelDTO,
  ): Promise<BugLabelDTO> {
    return this.labelService.createLabel(project, dto);
  }

  @ApiOperation({ summary: 'Update a bug label' })
  @ApiResponse({ type: BugLabelDTO })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:labelId')
  updateLabel(
    @CurrentProject() project: Project,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @Body() dto: UpdateBugLabelDTO,
  ): Promise<BugLabelDTO> {
    return this.labelService.updateLabel(project, labelId, dto);
  }

  @ApiOperation({ summary: 'Delete a bug label' })
  @ApiResponse({ type: PositiveResponseDto })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:labelId')
  async deleteLabel(
    @CurrentProject() project: Project,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ): Promise<PositiveResponseDto> {
    await this.labelService.deleteLabel(project, labelId);

    return PositiveResponseDto.instance();
  }
}
