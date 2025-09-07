import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule (compile)', () => {
  it('compiles with config', async () => {
    // Provide what JwtModule.registerAsync reads from ConfigService
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES_IN = '15m';

    const moduleRef = await Test.createTestingModule({
      imports: [
        // Makes ConfigService available to JwtModule.registerAsync
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});