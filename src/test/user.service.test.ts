import userService from '../modules/user/user.service.js';
import userRepository from '../modules/user/user.repository.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

jest.mock('../modules/user/user.repository.js', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1, name: 'Alice', email: 'alice@test.com' }];
      (userRepository.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.getUsers();
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user if exists', async () => {
      const mockUser = { id: 1, name: 'Alice' };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com' };

    it('should update user metadata if found with valid input', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Alice Updated', email: 'alice@test.com' });

      const result = await userService.updateUser(1, { name: 'Alice Updated' });
      expect(userRepository.update).toHaveBeenCalledWith(1, { name: 'Alice Updated' });
      expect(result.name).toBe('Alice Updated');
    });

    it('should throw NotFoundError if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUser(1, { name: 'Alice' })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if validation fails (e.g. invalid email)', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.updateUser(1, { email: 'invalid-email' })).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteUser', () => {
    const mockUser = { id: 1, name: 'Alice' };

    it('should delete user if exists', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.deleteUser(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if user not found during deletion', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.deleteUser(1)).rejects.toThrow(NotFoundError);
    });
  });
});
