// src/auth/jwt.strategy.spec.ts
import type { ConfigService } from '@nestjs/config';

let StrategyCtorMock: jest.Mock;
let extractorFn: jest.Mock;
let fromAuthHeaderAsBearerTokenMock: jest.Mock;

jest.mock('passport-jwt', () => {
  // mock extractor and Strategy
  extractorFn = jest.fn();
  fromAuthHeaderAsBearerTokenMock = jest.fn(() => extractorFn);

  StrategyCtorMock = jest.fn().mockImplementation(function (this: any, opts: any) {
    // passport (via @nestjs/passport) requires a name on the strategy instance
    (this as any).name = 'jwt';
    // expose opts for assertions
    (this as any).__opts = opts;
  });

  return {
    Strategy: StrategyCtorMock,
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: fromAuthHeaderAsBearerTokenMock,
    },
  };
});

// Import AFTER mocks in place
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs passport Strategy with jwtFromRequest + secret', () => {
    const cfg = {
      get: (k: string) => (k === 'JWT_SECRET' ? 'test_secret' : undefined),
    } as unknown as ConfigService;

    const strat = new JwtStrategy(cfg);

    expect(StrategyCtorMock).toHaveBeenCalledTimes(1);
    const firstArg = StrategyCtorMock.mock.calls[0][0];

    expect(fromAuthHeaderAsBearerTokenMock).toHaveBeenCalledTimes(1);
    expect(firstArg.secretOrKey).toBe('test_secret');
    expect(firstArg.jwtFromRequest).toBe(extractorFn);

    // sanity check our captured options on the instance
    expect((strat as any).__opts.secretOrKey).toBe('test_secret');
    expect((strat as any).__opts.jwtFromRequest).toBe(extractorFn);
    // and ensure name is present (required by passport)
    expect((strat as any).name).toBe('jwt');
  });

  it('validate returns payload unchanged', async () => {
    const cfg = { get: () => 'ignored' } as unknown as ConfigService;
    const strat = new JwtStrategy(cfg);

    const payload = { sub: 'u-1', email: 'e@x.com' };
    await expect(strat.validate(payload)).resolves.toEqual(payload);
  });
});