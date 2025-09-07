import { AppService } from './app.service';

describe('AppService (unit)', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('getHello() should return the expected greeting', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  it('getHello() should always return a string', () => {
    const result = service.getHello();
    expect(typeof result).toBe('string');
  });
});