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
  Put,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BugReproductionStepDTO } from 'models/dto/BugReproductionStep.dto';
import { CreateBugReproductionStepDTO } from 'models/dto/CreateBugReproductionStep.dto';
import { PositiveResponseDto } from 'models/dto/PositiveResponse.dto';
import { ReorderBugReproductionStepsDTO } from 'models/dto/ReorderBugReproductionSteps.dto';
import { UpdateBugReproductionStepDTO } from 'models/dto/UpdateBugReproductionStep.dto';
import { Project } from 'models/entity/Project.entity';
import { BugService } from 'services/Bug.service';
import { BugReproductionStepService } from 'services/BugReproductionStep.service';

@ApiTags('Bug Reproduction Steps')
@Controller(
  '/organizations/:organizationId/projects/:projectId/bugs/:bugId/steps',
)
export class BugReproductionStepController {
  constructor(
    private readonly stepService: BugReproductionStepService,
    private readonly bugService: BugService,
  ) {}

  @ApiOperation({ summary: 'List reproduction steps' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Get('/')
  getSteps(
    @Param('bugId', ParseUUIDPipe) bugId: string,
  ): Promise<BugReproductionStepDTO[]> {
    return this.stepService.getSteps(bugId);
  }

  @ApiOperation({ summary: 'Add a reproduction step' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Post('/')
  async createStep(
    @CurrentProject() project: Project,
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: CreateBugReproductionStepDTO,
  ): Promise<BugReproductionStepDTO> {
    const bug = await this.bugService.findBugOrThrow(project, bugId);

    return this.stepService.createStep(bug, dto);
  }

  @ApiOperation({ summary: 'Update a reproduction step' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Patch('/:stepId')
  async updateStep(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Param('stepId', ParseUUIDPipe) stepId: string,
    @Body() dto: UpdateBugReproductionStepDTO,
  ): Promise<BugReproductionStepDTO> {
    return this.stepService.updateStep(bugId, stepId, dto);
  }

  @ApiOperation({ summary: 'Bulk reorder reproduction steps' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Put('/reorder')
  reorderSteps(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Body() dto: ReorderBugReproductionStepsDTO,
  ): Promise<BugReproductionStepDTO[]> {
    return this.stepService.reorderSteps(bugId, dto);
  }

  @ApiOperation({ summary: 'Delete a reproduction step' })
  @Version('1')
  @PreAuthorize()
  @ProjectMemberOnly()
  @Delete('/:stepId')
  async deleteStep(
    @Param('bugId', ParseUUIDPipe) bugId: string,
    @Param('stepId', ParseUUIDPipe) stepId: string,
  ): Promise<PositiveResponseDto> {
    await this.stepService.deleteStep(bugId, stepId);

    return PositiveResponseDto.instance();
  }
}
