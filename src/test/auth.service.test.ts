import authService from '../modules/auth/auth.service.js';
import authRepository from '../modules/auth/auth.repository.js';
import refreshTokenRepository from '../modules/auth/refresh-token.repository.js';
import * as jwtUtils from '../utils/jwt.js';
import bcrypt from 'bcrypt';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

jest.mock('../modules/auth/auth.repository.js', () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  },
}));

jest.mock('../modules/auth/refresh-token.repository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    deleteByUserId: jest.fn(),
    findByToken: jest.fn(),
  },
}));

jest.mock('../utils/jwt.js', () => ({
  __esModule: true,
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockInput = {
      email: 'newuser@test.com',
      password: 'Password123',
      name: 'New User',
    };

    it('should register a user successfully', async () => {
      (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      
      const mockCreatedUser = {
        id: 1,
        email: mockInput.email,
        name: mockInput.name,
        role: 'USER',
      };
      (authRepository.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access_token');
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');

      const result = await authService.register(mockInput);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockInput.password, 10);
      expect(authRepository.createUser).toHaveBeenCalledWith({
        name: mockInput.name,
        email: mockInput.email,
        password: 'hashed_password',
      });
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        'refresh_token',
        mockCreatedUser.id,
        expect.any(Date)
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: mockCreatedUser,
      });
    });

    it('should throw BadRequestError if email already exists', async () => {
      (authRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(authService.register(mockInput)).rejects.toThrow(BadRequestError);
      expect(authRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if input validation fails (e.g. invalid email)', async () => {
      const invalidInput = { ...mockInput, email: 'invalid-email' };
      await expect(authService.register(invalidInput)).rejects.toThrow(BadRequestError);
    });
  });

  describe('login', () => {
    const mockInput = {
      email: 'user@test.com',
      password: 'Password123',
    };

    const mockUser = {
      id: 1,
      email: mockInput.email,
      password: 'hashed_password',
      role: 'USER',
      name: 'User',
    };

    it('should login a user successfully with correct credentials', async () => {
      (authRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('access_token');
      (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');

      const result = await authService.login(mockInput);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockInput.password, 'hashed_password');
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        'refresh_token',
        mockUser.id,
        expect.any(Date)
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: mockUser,
      });
    });

    it('should throw BadRequestError if user not found', async () => {
      (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockInput)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if password does not match', async () => {
      (authRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockInput)).rejects.toThrow(BadRequestError);
    });
  });

  describe('logout', () => {
    it('should clear refresh tokens for user ID', async () => {
      const result = await authService.logout(1);
      expect(refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  });

  describe('refreshAccessToken', () => {
    const mockToken = 'valid_refresh_token';

    it('should return new access token if refresh token is valid and not expired', async () => {
      const mockDecoded = { id: 1, email: 'user@test.com', role: 'USER' };
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
      
      const mockStoredToken = {
        token: mockToken,
        userId: 1,
        expiresAt: new Date(Date.now() + 100000),
      };
      (refreshTokenRepository.findByToken as jest.Mock).mockResolvedValue(mockStoredToken);
      (jwtUtils.generateAccessToken as jest.Mock).mockReturnValue('new_access_token');

      const result = await authService.refreshAccessToken(mockToken);

      expect(jwtUtils.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(mockToken);
      expect(jwtUtils.generateAccessToken).toHaveBeenCalledWith(mockDecoded);
      expect(result).toEqual({ accessToken: 'new_access_token' });
    });

    it('should throw UnauthorizedError if token is not found in DB', async () => {
      const mockDecoded = { id: 1 };
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
      (refreshTokenRepository.findByToken as jest.Mock).mockResolvedValue(null);

      await expect(authService.refreshAccessToken(mockToken)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token is expired', async () => {
      const mockDecoded = { id: 1 };
      (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
      
      const mockExpiredToken = {
        token: mockToken,
        userId: 1,
        expiresAt: new Date(Date.now() - 100000), // in the past
      };
      (refreshTokenRepository.findByToken as jest.Mock).mockResolvedValue(mockExpiredToken);

      await expect(authService.refreshAccessToken(mockToken)).rejects.toThrow(UnauthorizedError);
    });
  });
});
