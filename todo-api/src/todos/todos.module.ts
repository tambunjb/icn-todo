import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';

@Module({
  providers: [PrismaService, TodosService],
  controllers: [TodosController],
})
export class TodosModule {}