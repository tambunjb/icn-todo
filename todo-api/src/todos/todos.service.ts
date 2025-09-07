import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, body: string) {
    const text = body?.trim();
    if (!text) throw new BadRequestException('todo cannot be empty');

    return this.prisma.todo.create({
      data: { userId, body: text },
      select: { id: true, body: true, isDone: true, createdAt: true, updatedAt: true },
    });
  }

  async list(userId: string) {
    return this.prisma.todo.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, body: true, isDone: true, createdAt: true, updatedAt: true },
    });
  }

  async update(userId: string, id: string, patch: { body?: string; isDone?: boolean }) {
    const found = await this.prisma.todo.findFirst({ where: { id, userId, deletedAt: null } });
    if (!found) throw new NotFoundException('todo not found');

    const data: any = {};
    if (patch.body !== undefined) {
      const text = patch.body.trim();
      if (!text) throw new BadRequestException('todo cannot be empty');
      data.body = text;
    }
    if (patch.isDone !== undefined) data.isDone = patch.isDone;

    return this.prisma.todo.update({
      where: { id },
      data,
      select: { id: true, body: true, isDone: true, updatedAt: true },
    });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.todo.findFirst({ where: { id, userId, deletedAt: null } });
    if (!found) throw new NotFoundException('todo not found');

    return this.prisma.todo.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });
  }
}