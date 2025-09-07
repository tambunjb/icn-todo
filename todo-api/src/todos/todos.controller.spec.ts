import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

describe('TodosController (unit)', () => {
  const mockService: jest.Mocked<TodosService> = {
    create: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  let controller: TodosController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TodosController(mockService);
  });

  const req = { user: { sub: 'u1', email: 'u@example.com' } } as any;

  it('create passes user.sub and body.body', async () => {
    const dto = { body: 'buy milk' };
    const created = { id: 't1', body: 'buy milk', isDone: false, createdAt: new Date(), updatedAt: new Date() };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(req, dto);

    expect(mockService.create).toHaveBeenCalledWith('u1', 'buy milk');
    expect(result).toBe(created);
  });

  it('list passes user.sub', async () => {
    const list = [{ id: 'a', body: 'x', isDone: false, createdAt: new Date(), updatedAt: new Date() }];
    mockService.list.mockResolvedValue(list);

    const result = await controller.list(req);

    expect(mockService.list).toHaveBeenCalledWith('u1');
    expect(result).toBe(list);
  });

  it('update passes user.sub, id, and patch', async () => {
    const patch = { body: 'new', isDone: true };
    const updated = { id: 't1', body: 'new', isDone: true, updatedAt: new Date() };
    mockService.update.mockResolvedValue(updated);

    const result = await controller.update(req, 't1', patch);

    expect(mockService.update).toHaveBeenCalledWith('u1', 't1', patch);
    expect(result).toBe(updated);
  });

  it('remove passes user.sub and id', async () => {
    const removed = { id: 't1', deletedAt: new Date() };
    mockService.remove.mockResolvedValue(removed);

    const result = await controller.remove(req, 't1');

    expect(mockService.remove).toHaveBeenCalledWith('u1', 't1');
    expect(result).toBe(removed);
  });
});