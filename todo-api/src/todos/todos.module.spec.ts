// src/todos/todos.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TodosModule } from './todos.module';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { PrismaService } from '../prisma.service';

describe('TodosModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TodosModule],
    }).compile();
  });

  it('compiles the module', async () => {
    const app = moduleRef.createNestApplication();
    await expect(app.init()).resolves.not.toThrow();
    await app.close();
  });

  it('provides TodosService', () => {
    const svc = moduleRef.get<TodosService>(TodosService);
    expect(svc).toBeDefined();
    // optional: check a known method exists
    expect(typeof (svc as any).create).toBe('function');
  });

  it('provides PrismaService (by token) and exposes expected API shape', () => {
    const prisma = moduleRef.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
    // shape checks — we only assert what our code uses
    expect(typeof (prisma as any).$connect).toBe('function');
    expect(typeof (prisma as any).todo?.create).toBe('function'); // model delegate exists
  });

  it('registers TodosController', () => {
    const controller = moduleRef.get<TodosController>(TodosController);
    expect(controller).toBeDefined();
    expect(typeof (controller as any).list).toBe('function');
  });
});