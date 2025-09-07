import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

// Hard-mock bcrypt so we don’t touch native crypto
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_pw'),
  compare: jest.fn().mockResolvedValue(true),
}));
import * as bcrypt from 'bcrypt';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const jwtMock: jest.Mocked<JwtService> = {
  sign: jest.fn(),
  signAsync: jest.fn().mockResolvedValue('jwt_token'),
  decode: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
} as any;

describe('AuthService (unit)', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prismaMock as any, jwtMock);
  });

  describe('register', () => {
    it('creates user when email not taken (lowercases + trims + hashes)', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'u1',
        email: 'john@example.com',
        displayName: 'John',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      });

      const res = await service.register('  John@Example.com  ', 'secret', 'John');

      // email normalized
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      // hash called with salt rounds 12
      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
      // prisma create called with hashed password
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'john@example.com',
          passwordHash: 'hashed_pw',
          displayName: 'John',
        },
      });
      // returns safe fields only
      expect(res).toEqual({
        id: 'u1',
        email: 'john@example.com',
        displayName: 'John',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      });
    });

    it('throws ConflictException if email already used', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'u1' });

      await expect(
        service.register('user@example.com', 'pw'),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns JWT when credentials are valid', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      jwtMock.signAsync.mockResolvedValueOnce('signed.jwt.token');

      const res = await service.login('  USER@example.com ', 'pw');

      // normalized email lookup
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      // password verified
      expect(bcrypt.compare).toHaveBeenCalledWith('pw', 'hashed_pw');
      // jwt payload
      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'user@example.com',
      });
      expect(res).toEqual({ accessToken: 'signed.jwt.token' });
    });

    it('throws Unauthorized if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login('a@b.com', 'pw'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('throws Unauthorized if password mismatch', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login('user@example.com', 'wrong'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});