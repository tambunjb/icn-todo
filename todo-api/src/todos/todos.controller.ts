import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todos: TodosService) {}

  @Post()
  create(@Req() req: any, @Body() body: { body: string }) {
    return this.todos.create(req.user.sub, body.body);
  }

  @Get()
  list(@Req() req: any) {
    return this.todos.list(req.user.sub);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() patch: { body?: string; isDone?: boolean }) {
    return this.todos.update(req.user.sub, id, patch);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.todos.remove(req.user.sub, id);
  }
}