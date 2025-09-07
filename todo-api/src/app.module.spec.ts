import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule (compilation only)', () => {
  it('should compile the root module', async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(mod).toBeDefined();
  });
});