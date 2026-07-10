import boardService from '../modules/board/board.service.js';
import boardRepository from '../modules/board/board.repository.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { BoardRole } from '@prisma/client';

jest.mock('../modules/board/board.repository.js', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMember: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    updateMemberRole: jest.fn(),
  },
}));

describe('BoardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBoards', () => {
    it('should return all active boards', async () => {
      const mockBoards = [{ id: 1, name: 'Board 1', archived: false }];
      (boardRepository.findAll as jest.Mock).mockResolvedValue(mockBoards);

      const result = await boardService.getBoards();
      expect(boardRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockBoards);
    });
  });

  describe('getBoardById', () => {
    it('should return board if found', async () => {
      const mockBoard = { id: 1, name: 'Board 1' };
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);

      const result = await boardService.getBoardById(1);
      expect(boardRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundError if board is not found', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(boardService.getBoardById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createBoard', () => {
    it('should create board with valid input', async () => {
      const mockBoard = { id: 1, name: 'New Board', ownerId: 10 };
      (boardRepository.create as jest.Mock).mockResolvedValue(mockBoard);

      const result = await boardService.createBoard('New Board', 10);
      expect(boardRepository.create).toHaveBeenCalledWith({ name: 'New Board', ownerId: 10 });
      expect(result).toEqual(mockBoard);
    });

    it('should throw BadRequestError on validation schema failure (empty name)', async () => {
      await expect(boardService.createBoard('', 10)).rejects.toThrow(BadRequestError);
      expect(boardRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateBoard', () => {
    const mockBoard = { id: 1, name: 'Old Board' };

    it('should update board if found with valid input', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.update as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated Board' });

      const result = await boardService.updateBoard(1, 'Updated Board');
      expect(boardRepository.update).toHaveBeenCalledWith(1, { name: 'Updated Board' });
      expect(result.name).toBe('Updated Board');
    });

    it('should throw NotFoundError if board not found', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(boardService.updateBoard(1, 'Updated Board')).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError on validation schema failure (empty name)', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);

      await expect(boardService.updateBoard(1, '')).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteBoard', () => {
    const mockBoard = { id: 1, name: 'Board to delete' };

    it('should delete board if it exists', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.delete as jest.Mock).mockResolvedValue(mockBoard);

      const result = await boardService.deleteBoard(1);
      expect(boardRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundError if board to delete not found', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(boardService.deleteBoard(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('archiveBoard / restoreBoard', () => {
    const mockBoard = { id: 1, name: 'Board', archived: false };

    it('should archive board successfully', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.update as jest.Mock).mockResolvedValue({ ...mockBoard, archived: true });

      const result = await boardService.archiveBoard(1);
      expect(boardRepository.update).toHaveBeenCalledWith(1, { archived: true });
      expect(result.archived).toBe(true);
    });

    it('should throw NotFoundError when archiving a non-existent board', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(boardService.archiveBoard(1)).rejects.toThrow(NotFoundError);
    });

    it('should restore board successfully', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue({ ...mockBoard, archived: true });
      (boardRepository.update as jest.Mock).mockResolvedValue({ ...mockBoard, archived: false });

      const result = await boardService.restoreBoard(1);
      expect(boardRepository.update).toHaveBeenCalledWith(1, { archived: false });
      expect(result.archived).toBe(false);
    });
  });

  describe('addBoardMember', () => {
    const mockBoard = { id: 1, name: 'Board' };

    it('should add member successfully', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue(null);
      (boardRepository.addMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.MEMBER });

      const result = await boardService.addBoardMember(1, 2, BoardRole.MEMBER);
      expect(boardRepository.addMember).toHaveBeenCalledWith(1, 2, BoardRole.MEMBER);
      expect(result.role).toBe(BoardRole.MEMBER);
    });

    it('should throw BadRequestError if user is already a member', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2 });

      await expect(boardService.addBoardMember(1, 2, BoardRole.MEMBER)).rejects.toThrow(BadRequestError);
    });
  });

  describe('removeBoardMember', () => {
    const mockBoard = { id: 1, name: 'Board' };

    it('should remove member successfully if not the owner', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.MEMBER });

      const result = await boardService.removeBoardMember(1, 2);
      expect(boardRepository.removeMember).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(true);
    });

    it('should throw BadRequestError if attempting to remove the board owner', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.OWNER });

      await expect(boardService.removeBoardMember(1, 2)).rejects.toThrow(BadRequestError);
      expect(boardRepository.removeMember).not.toHaveBeenCalled();
    });
  });

  describe('updateBoardMemberRole', () => {
    const mockBoard = { id: 1, name: 'Board' };

    it('should update role successfully for valid inputs', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.MEMBER });
      (boardRepository.updateMemberRole as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.VIEWER });

      const result = await boardService.updateBoardMemberRole(1, 2, BoardRole.VIEWER);
      expect(boardRepository.updateMemberRole).toHaveBeenCalledWith(1, 2, BoardRole.VIEWER);
      expect(result.role).toBe(BoardRole.VIEWER);
    });

    it('should throw BadRequestError if trying to change the role of the board owner', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.OWNER });

      await expect(boardService.updateBoardMemberRole(1, 2, BoardRole.MEMBER)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if trying to set new role to OWNER (ownership transfer check)', async () => {
      (boardRepository.findById as jest.Mock).mockResolvedValue(mockBoard);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ boardId: 1, userId: 2, role: BoardRole.MEMBER });

      await expect(boardService.updateBoardMemberRole(1, 2, BoardRole.OWNER)).rejects.toThrow(BadRequestError);
    });
  });
});
