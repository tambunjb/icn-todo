import type { INestApplication } from '@nestjs/common';

// Hard-mock @nestjs/core so no real server spins up
jest.mock('@nestjs/core', () => {
  return {
    NestFactory: {
      create: jest.fn(),
    },
  };
});

import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';

describe('bootstrap (unit)', () => {
  const originalEnv = process.env;
  let listenMock: jest.Mock;
  let appMock: Partial<INestApplication>;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NODE_ENV: 'test' }; // ensure guard
    listenMock = jest.fn().mockResolvedValue(undefined);
    appMock = { listen: listenMock } as unknown as INestApplication;

    (NestFactory.create as jest.Mock).mockResolvedValue(appMock);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('creates app with CORS enabled', async () => {
    process.env.PORT = '1234';
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule, { cors: true });
  });

  it('uses process.env.PORT when set', async () => {
    process.env.PORT = '5555';
    await bootstrap();

    // listen receives the string "5555" because code uses env directly
    expect(listenMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith('5555');
  });

  it('falls back to 3333 when PORT not set', async () => {
    delete process.env.PORT;
    await bootstrap();

    expect(listenMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith(3333);
  });
});