import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

// Fake AI provider to avoid network calls
class FakeAiService {
  async suggest(input: string): Promise<string[]> {
    return [
      `Try: ${input} #1`,
      `Try: ${input} #2`,
      `Try: ${input} #3`,
    ];
  }
}

describe('E2E: auth, todos, ai', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token = '';
  let todoId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override AiService token by class name path
      .overrideProvider(require('../src/ai/ai.service').AiService)
      .useClass(FakeAiService)
      .compile();

    app = await moduleRef.createNestApplication().init();
    prisma = app.get(PrismaService);

    // Clean DB (isolation)
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register -> 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'secret123', displayName: 'Tester' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      email: 'test@example.com',
      displayName: 'Tester',
      createdAt: expect.any(String),
    });
  });

  it('POST /auth/login -> 200 & returns accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    token = res.body.accessToken;
  });

  it('POST /todos (auth) -> 201 create todo', async () => {
    const res = await request(app.getHttpServer())
      .post('/todos')
      .set('authorization', `Bearer ${token}`)
      .send({ body: 'learn programming' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      body: 'learn programming',
      isDone: false,
    });
    todoId = res.body.id;
  });

  it('GET /todos (auth) -> 200 list includes created todo', async () => {
    const res = await request(app.getHttpServer())
      .get('/todos')
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    // ✅ In the simple version, list() returns an array from prisma.todo.findMany
    expect(Array.isArray(res.body)).toBe(true);

    // Should contain the item we created earlier
    const items: any[] = res.body;
    expect(items.length).toBeGreaterThan(0);
    expect(items.some(t => t.id === todoId && t.body === 'learn programming')).toBe(true);
  });

  it('PATCH /todos/:id (auth) -> 200 update todo', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/todos/${todoId}`)
      .set('authorization', `Bearer ${token}`)
      .send({ isDone: true })
      .expect(200);

    expect(res.body).toMatchObject({ id: todoId, isDone: true });
  });

  it('DELETE /todos/:id (auth) -> 200 soft delete', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/todos/${todoId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: todoId, deletedAt: expect.any(String) });
  });

  it('POST /ai/suggest (auth) -> 201 returns 3 suggestions (from FakeAiService)', async () => {
    const res = await request(app.getHttpServer())
      .post('/ai/suggest')
      .set('authorization', `Bearer ${token}`) // if you kept it public, you can remove this
      .send({ input: 'organize my day' })
      .expect(201);

    expect(res.body).toHaveProperty('suggestions');
    expect(res.body.suggestions).toHaveLength(3);
    expect(res.body.suggestions[0]).toContain('organize my day');
  });
});