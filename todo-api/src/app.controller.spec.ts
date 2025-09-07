import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController (unit)', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<AppService> = {
      getHello: jest.fn().mockReturnValue('Hello World! (from mock)'),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockService }, // <-- isolation: mock the dependency
      ],
    }).compile();

    controller = moduleRef.get(AppController);
    appService = moduleRef.get(AppService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET / (getHello) should delegate to AppService.getHello', () => {
    const result = controller.getHello();
    expect(appService.getHello).toHaveBeenCalledTimes(1);
    expect(result).toBe('Hello World! (from mock)');
  });

  it('should propagate different service return values', () => {
    appService.getHello.mockReturnValueOnce('Different value');
    expect(controller.getHello()).toBe('Different value');
  });
});