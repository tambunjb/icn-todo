import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('register -> forwards to service and returns result', async () => {
    const dto = { email: 'a@b.com', password: 'pw', displayName: 'A' };
    const expected = { id: 'u1', email: 'a@b.com', displayName: 'A', createdAt: new Date() };
    authServiceMock.register.mockResolvedValueOnce(expected);

    const res = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith('a@b.com', 'pw', 'A');
    expect(res).toEqual(expected);
  });

  it('login -> forwards to service and returns token', async () => {
    const dto = { email: 'a@b.com', password: 'pw' };
    authServiceMock.login.mockResolvedValueOnce({ accessToken: 't' });

    const res = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(res).toEqual({ accessToken: 't' });
  });
});