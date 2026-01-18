import { Controller, Post, Body, Get, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('save')
  async saveProgress(
    @Body() body: { name: string; moduleId: string; taskId: number; score: number; total: number; userId?: string },
  ) {
    console.log(`Received progress save request: User=${body.name}, ID=${body.userId}, Module=${body.moduleId}, Task=${body.taskId}, Score=${body.score}/${body.total}`);
    return this.progressService.saveProgress(
      body.name,
      body.moduleId,
      body.taskId,
      body.score,
      body.total,
      body.userId,
    );
  }

  @Get('all')
  // @UseGuards(JwtAuthGuard) // Will be enabled after auth setup
  async getAllProgress(@Query('search') search?: string) {
    return this.progressService.getAllUsersProgress(search);
  }

  @Delete('user/:userId')
  // @UseGuards(JwtAuthGuard) // Will be enabled after auth setup
  async deleteUser(@Param('userId') userId: string) {
    return this.progressService.deleteUser(userId);
  }

  @Get('check/:name')
  async checkUserExists(@Param('name') name: string) {
    return this.progressService.checkUserExists(name);
  }

  @Post('reset/:userId')
  async resetUserProgress(@Param('userId') userId: string) {
    return this.progressService.resetUserProgress(userId);
  }

  @Post('emotion-save')
  async saveEmotionResponse(
    @Body() body: {
      userId: string;
      moduleId: string;
      taskId: number;
      emotionResponses: Array<{ emotionId: string; reasoning: string; selectedTechnique: string }>;
    },
  ) {
    console.log(`Received emotion response save: User=${body.userId}, Module=${body.moduleId}, Task=${body.taskId}`);
    return this.progressService.saveEmotionResponse(
      body.userId,
      body.moduleId,
      body.taskId,
      body.emotionResponses,
    );
  }

  @Post('decision-save')
  async saveDecisionResponse(
    @Body() body: {
      userId: string;
      moduleId: string;
      taskId: number;
      decisionResponses: Array<{ scenarioId: string; selectedOption: string }>;
    },
  ) {
    console.log(`Received decision response save: User=${body.userId}, Module=${body.moduleId}, Task=${body.taskId}`);
    return this.progressService.saveDecisionResponse(
      body.userId,
      body.moduleId,
      body.taskId,
      body.decisionResponses,
    );
  }
}
