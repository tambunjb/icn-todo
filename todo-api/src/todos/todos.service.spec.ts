import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';

describe('TodosService (unit)', () => {
  const mockPrisma = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: TodosService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TodosService(mockPrisma as any);
  });

  describe('create', () => {
    it('trims input, calls prisma, returns created todo', async () => {
      const userId = 'u1';
      const input = '  buy milk  ';
      const created = {
        id: 't1',
        body: 'buy milk',
        isDone: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.todo.create.mockResolvedValue(created);

      const result = await service.create(userId, input);

      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: { userId, body: 'buy milk' },
        select: { id: true, body: true, isDone: true, createdAt: true, updatedAt: true },
      });
      expect(result).toBe(created);
    });

    it('throws BadRequestException on empty/whitespace', async () => {
      await expect(service.create('u1', '   ')).rejects.toBeInstanceOf(BadRequestException);
      expect(mockPrisma.todo.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('queries only non-deleted todos for a user ordered by createdAt desc', async () => {
      const rows = [
        { id: 'a', body: 'x', isDone: false, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrisma.todo.findMany.mockResolvedValue(rows);

      const result = await service.list('u1');

      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: { id: true, body: true, isDone: true, createdAt: true, updatedAt: true },
      });
      expect(result).toBe(rows);
    });
  });

  describe('update', () => {
    it('throws NotFound if todo not found / not owned / soft-deleted', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);
      await expect(service.update('u1', 't1', { body: 'hi' }))
        .rejects.toBeInstanceOf(NotFoundException);
      expect(mockPrisma.todo.update).not.toHaveBeenCalled();
    });

    it('throws BadRequest if body provided but empty after trim', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue({ id: 't1' });
      await expect(service.update('u1', 't1', { body: '   ' }))
        .rejects.toBeInstanceOf(BadRequestException);
      expect(mockPrisma.todo.update).not.toHaveBeenCalled();
    });

    it('updates body and isDone when both provided', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue({ id: 't1' });
      const updated = { id: 't1', body: 'new', isDone: true, updatedAt: new Date() };
      mockPrisma.todo.update.mockResolvedValue(updated);

      const result = await service.update('u1', 't1', { body: '  new  ', isDone: true });

      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { body: 'new', isDone: true },
        select: { id: true, body: true, isDone: true, updatedAt: true },
      });
      expect(result).toBe(updated);
    });

    it('updates only isDone when body omitted', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue({ id: 't1' });
      const updated = { id: 't1', body: 'keep', isDone: false, updatedAt: new Date() };
      mockPrisma.todo.update.mockResolvedValue(updated);

      const result = await service.update('u1', 't1', { isDone: false });

      expect(mockPrisma.todo.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { isDone: false },
        select: { id: true, body: true, isDone: true, updatedAt: true },
      });
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('throws NotFound if todo not found / not owned / already deleted', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);
      await expect(service.remove('u1', 't1')).rejects.toBeInstanceOf(NotFoundException);
      expect(mockPrisma.todo.update).not.toHaveBeenCalled();
    });

    it('soft-deletes by setting deletedAt', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue({ id: 't1' });
      const updated = { id: 't1', deletedAt: new Date() };
      mockPrisma.todo.update.mockResolvedValue(updated);

      const result = await service.remove('u1', 't1');

      // Check shape; exact date value not asserted
      const call = mockPrisma.todo.update.mock.calls[0][0];
      expect(call.where).toEqual({ id: 't1' });
      expect(call.data.deletedAt).toBeInstanceOf(Date);
      expect(call.select).toEqual({ id: true, deletedAt: true });
      expect(result).toBe(updated);
    });
  });
});