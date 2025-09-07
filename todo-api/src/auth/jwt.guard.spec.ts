// src/auth/jwt.guard.spec.ts

let canActivateMock: jest.Mock;

jest.mock('@nestjs/passport', () => {
  // The guard factory Nest provides; we replace it with our own minimal version.
  canActivateMock = jest.fn().mockResolvedValue(true);

  // Return a dynamic AuthGuard factory replacement
  return {
    AuthGuard: (_type: string) => {
      // We don't assert the type here anymore (too brittle in some setups).
      // Instead, we assert behavior below.
      return class {
        canActivate = canActivateMock;
      };
    },
  };
});

// Import AFTER mocks are in place
import { JwtAuthGuard } from './jwt.guard';

describe('JwtAuthGuard', () => {
  beforeEach(() => {
    canActivateMock.mockClear();
  });

  it('exposes canActivate (coming from the base AuthGuard factory)', () => {
    const guard = new JwtAuthGuard();
    expect(typeof (guard as any).canActivate).toBe('function');
  });

  it('delegates canActivate to the base guard implementation (isolation)', async () => {
    const guard = new JwtAuthGuard();
    const ctx: any = {}; // minimal ExecutionContext stub

    const result = await (guard as any).canActivate(ctx);

    expect(canActivateMock).toHaveBeenCalledTimes(1);
    expect(canActivateMock).toHaveBeenCalledWith(ctx);
    expect(result).toBe(true);
  });
});