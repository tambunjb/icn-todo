/**
 * Unit tests for PrismaService (isolated, no real DB).
 * We mock @prisma/client so no network or DB happens.
 */

import { PrismaService } from './prisma.service';

// Mock @prisma/client with a lightweight class so `extends PrismaClient` works.
jest.mock('@prisma/client', () => {
  class MockPrismaClient {
    public $connect = jest.fn();
    public $disconnect = jest.fn();
  }
  return { PrismaClient: MockPrismaClient };
});

describe('PrismaService', () => {
  it('does not auto-connect in constructor', () => {
    const service = new PrismaService();
    const connectMock = (service as any).$connect as jest.Mock;

    expect(connectMock).toBeDefined();
    expect(connectMock).not.toHaveBeenCalled();
  });

  it('calls $connect exactly once on onModuleInit()', async () => {
    const service = new PrismaService();
    const connectMock = (service as any).$connect as jest.Mock;

    await service.onModuleInit();

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledWith(); // no args
  });

  it('propagates connection errors thrown by $connect', async () => {
    const service = new PrismaService();
    const connectMock = (service as any).$connect as jest.Mock;
    const err = new Error('boom');

    connectMock.mockRejectedValueOnce(err);

    await expect(service.onModuleInit()).rejects.toThrow(err);
    expect(connectMock).toHaveBeenCalledTimes(1);
  });
});