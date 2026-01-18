import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async saveProgress(name: string, moduleId: string, taskId: number, score: number, total: number, userId?: string) {
    let user;
    
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    }

    if (!user) {
      // Check if user with this exact name exists
      const existingUser = await this.prisma.user.findFirst({
        where: { name: name },
      });

      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: { 
            name: name,
            ...(userId ? { id: userId } : {}),
          },
        });
      }
    }

    // Upsert result
    const result = await this.prisma.result.upsert({
      where: {
        userId_moduleId_taskId: {
          userId: user.id,
          moduleId: moduleId,
          taskId: taskId,
        },
      },
      update: {
        score: score,
        total: total,
      },
      create: {
        userId: user.id,
        moduleId: moduleId,
        taskId: taskId,
        score: score,
        total: total,
      },
    });

    return { user, result };
  }

  async getAllUsersProgress(search?: string) {
    return this.prisma.user.findMany({
      where: search ? {
        name: {
          contains: search,
          // mode: 'insensitive' // SQLite doesn't support 'mode: insensitive' directly in Prisma without special setup, 
          // but SQLite LIKE is case-insensitive by default or we can just rely on standard prisma behavior
        }
      } : {},
      include: {
        results: true,
        emotionResponses: true,
        decisionResponses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteUser(userId: string) {
    // First delete all results for this user
    await this.prisma.result.deleteMany({
      where: { userId: userId },
    });

    // Then delete the user
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async checkUserExists(name: string) {
    return this.prisma.user.findFirst({
      where: { name: name },
      include: {
        results: true,
      },
    });
  }

  async resetUserProgress(userId: string) {
    // Delete all results for this user
    return this.prisma.result.deleteMany({
      where: { userId: userId },
    });
  }

  async saveEmotionResponse(
    userId: string,
    moduleId: string,
    taskId: number,
    emotionResponses: Array<{ emotionId: string; reasoning: string; selectedTechnique: string }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete all existing responses for this specific task
      await tx.emotionResponse.deleteMany({
        where: {
          userId: userId,
          moduleId: moduleId,
          taskId: taskId,
        },
      });

      const responses: any[] = [];
      
      // Create new responses
      for (const response of emotionResponses) {
        const saved = await tx.emotionResponse.create({
          data: {
            userId: userId,
            moduleId: moduleId,
            taskId: taskId,
            emotionId: response.emotionId,
            reasoning: response.reasoning,
            selectedTechnique: response.selectedTechnique,
          },
        });
        responses.push(saved);
      }

      return { success: true, savedCount: responses.length, responses };
    });
  }

  async saveDecisionResponse(
    userId: string,
    moduleId: string,
    taskId: number,
    decisionResponses: Array<{ scenarioId: string; selectedOption: string }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Delete existing responses for this task
      await tx.decisionResponse.deleteMany({
        where: {
          userId,
          moduleId,
          taskId,
        },
      });

      const responses: any[] = [];
      for (const response of decisionResponses) {
        const saved = await tx.decisionResponse.create({
          data: {
            userId,
            moduleId,
            taskId,
            scenarioId: response.scenarioId,
            selectedOption: response.selectedOption,
          },
        });
        responses.push(saved);
      }
      return { success: true, savedCount: responses.length, responses };
    });
  }
}
