import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiModule', () => {
  it('wires controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AiModule],
    })
      .overrideProvider(AiService) // keep isolation: swap with a dummy if desired
      .useValue({ suggest: jest.fn().mockResolvedValue(['a', 'b', 'c']) })
      .compile();

    const controller = moduleRef.get(AiController);
    const service = moduleRef.get(AiService);

    expect(controller).toBeInstanceOf(AiController);
    expect(service).toBeDefined();
  });
});