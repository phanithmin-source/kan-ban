import taskService from '../modules/task/task.service.js';
import taskRepository from '../modules/task/task.repository.js';
import boardService from '../modules/board/board.service.js';
import boardRepository from '../modules/board/board.repository.js';
import userRepository from '../modules/user/user.repository.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { TaskStatus, TaskPriority, BoardRole } from '@prisma/client';

jest.mock('../modules/task/task.repository.js', () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    assignTask: jest.fn(),
    findCommentById: jest.fn(),
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  },
}));

jest.mock('../modules/board/board.service.js', () => ({
  __esModule: true,
  default: {
    getBoardById: jest.fn(),
  },
}));

jest.mock('../modules/board/board.repository.js', () => ({
  __esModule: true,
  default: {
    findMember: jest.fn(),
  },
}));

jest.mock('../modules/user/user.repository.js', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should query and return tasks connection info with correct calculations', async () => {
      const mockResult = {
        data: [{ id: 1, title: 'Task 1' }],
        total: 15,
      };
      (taskRepository.findAll as jest.Mock).mockResolvedValue(mockResult);

      const filter = { page: 2, limit: 5, boardId: 10 };
      const result = await taskService.getTasks(filter);

      expect(taskRepository.findAll).toHaveBeenCalledWith({
        ...filter,
        page: 2,
        limit: 5,
      });
      expect(result).toEqual({
        data: mockResult.data,
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task if it exists', async () => {
      const mockTask = { id: 1, title: 'Test Task' };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(1);
      expect(taskRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundError if task does not exist', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.getTaskById(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createTask', () => {
    const mockInput = {
      title: 'New Task',
      description: 'Test description',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      boardId: 1,
      dueDate: '2026-07-10',
    };

    const mockUserAdmin = { id: 100, role: 'ADMIN' as const };
    const mockUserNormal = { id: 101, role: 'USER' as const };

    it('should allow admin to create a task even without board membership', async () => {
      (boardService.getBoardById as jest.Mock).mockResolvedValue({ id: 1, name: 'Board' });
      (taskRepository.create as jest.Mock).mockResolvedValue({ id: 9, ...mockInput });

      const result = await taskService.createTask(mockInput, mockUserAdmin);

      expect(boardService.getBoardById).toHaveBeenCalledWith(1);
      expect(boardRepository.findMember).not.toHaveBeenCalled();
      expect(taskRepository.create).toHaveBeenCalled();
      expect(result.id).toBe(9);
    });

    it('should allow board member to create a task', async () => {
      (boardService.getBoardById as jest.Mock).mockResolvedValue({ id: 1, name: 'Board' });
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.MEMBER });
      (taskRepository.create as jest.Mock).mockResolvedValue({ id: 10, ...mockInput });

      const result = await taskService.createTask(mockInput, mockUserNormal);

      expect(boardRepository.findMember).toHaveBeenCalledWith(1, mockUserNormal.id);
      expect(taskRepository.create).toHaveBeenCalled();
      expect(result.id).toBe(10);
    });

    it('should throw ForbiddenError if normal user is not a board member', async () => {
      (boardService.getBoardById as jest.Mock).mockResolvedValue({ id: 1, name: 'Board' });
      (boardRepository.findMember as jest.Mock).mockResolvedValue(null);

      await expect(taskService.createTask(mockInput, mockUserNormal)).rejects.toThrow(ForbiddenError);
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if member has VIEWER role', async () => {
      (boardService.getBoardById as jest.Mock).mockResolvedValue({ id: 1, name: 'Board' });
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.VIEWER });

      await expect(taskService.createTask(mockInput, mockUserNormal)).rejects.toThrow(ForbiddenError);
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if validation fails (empty title)', async () => {
      const invalidInput = { ...mockInput, title: '' };
      await expect(taskService.createTask(invalidInput, mockUserAdmin)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateTask', () => {
    const mockTask = { id: 10, boardId: 1, title: 'Old Title', creatorId: 101, assigneeId: null };
    const mockInput = { title: 'New Title' };
    const mockUserNormal = { id: 101, role: 'USER' as const }; // is the task creator

    it('should update a task if user is task creator and a board member', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.MEMBER });
      (taskRepository.update as jest.Mock).mockResolvedValue({ ...mockTask, title: 'New Title' });

      const result = await taskService.updateTask(10, mockInput, mockUserNormal);

      expect(taskRepository.update).toHaveBeenCalledWith(10, expect.objectContaining({ title: 'New Title' }));
      expect(result.title).toBe('New Title');
    });

    it('should throw ForbiddenError if user is a MEMBER but neither creator nor assignee', async () => {
      const otherTask = { ...mockTask, creatorId: 999, assigneeId: null };
      const otherUser = { id: 101, role: 'USER' as const };
      (taskRepository.findById as jest.Mock).mockResolvedValue(otherTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: otherUser.id, role: BoardRole.MEMBER });

      await expect(taskService.updateTask(10, mockInput, otherUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow board OWNER to edit any task regardless of creator/assignee', async () => {
      const ownerUser = { id: 999, role: 'USER' as const };
      const taskByOther = { ...mockTask, creatorId: 101, assigneeId: null };
      (taskRepository.findById as jest.Mock).mockResolvedValue(taskByOther);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: ownerUser.id, role: BoardRole.OWNER });
      (taskRepository.update as jest.Mock).mockResolvedValue({ ...taskByOther, title: 'New Title' });

      const result = await taskService.updateTask(10, mockInput, ownerUser);
      expect(taskRepository.update).toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });

    it('should allow MANAGER to edit any task without board membership check', async () => {
      const managerUser = { id: 999, role: 'MANAGER' as const };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.update as jest.Mock).mockResolvedValue({ ...mockTask, title: 'New Title' });

      const result = await taskService.updateTask(10, mockInput, managerUser);
      expect(boardRepository.findMember).not.toHaveBeenCalled();
      expect(result.title).toBe('New Title');
    });

    it('should throw ForbiddenError if non-admin/manager user is not a board member', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue(null);

      await expect(taskService.updateTask(10, mockInput, mockUserNormal)).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError if member role is VIEWER', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.VIEWER });

      await expect(taskService.updateTask(10, mockInput, mockUserNormal)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteTask', () => {
    const mockTask = { id: 10, boardId: 1, creatorId: 101 };
    const mockUserNormal = { id: 999, role: 'USER' as const }; // different from creatorId
    const mockUserCreator = { id: 101, role: 'USER' as const }; // task creator

    it('should throw ForbiddenError if non-admin/manager user is not board OWNER and not creator', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      // Member is not OWNER and not creator
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.MEMBER });

      await expect(taskService.deleteTask(10, mockUserNormal)).rejects.toThrow(ForbiddenError);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is board VIEWER', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.VIEWER });

      await expect(taskService.deleteTask(10, mockUserNormal)).rejects.toThrow(ForbiddenError);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete task if non-admin user is board OWNER', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.OWNER });
      (taskRepository.delete as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(10, mockUserNormal);

      expect(taskRepository.delete).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockTask);
    });

    it('should delete task if user is the task creator (even as MEMBER)', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserCreator.id, role: BoardRole.MEMBER });
      (taskRepository.delete as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(10, mockUserCreator);

      expect(taskRepository.delete).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockTask);
    });

    it('should allow MANAGER to delete any task without board membership check', async () => {
      const managerUser = { id: 500, role: 'MANAGER' as const };
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (taskRepository.delete as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.deleteTask(10, managerUser);

      expect(boardRepository.findMember).not.toHaveBeenCalled();
      expect(taskRepository.delete).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    const mockTask = { id: 10, boardId: 1, assigneeId: 200, status: TaskStatus.TODO };
    const mockUserNormal = { id: 200, role: 'USER' as const }; // matches assignee
    const mockUserOther = { id: 300, role: 'USER' as const }; // different assignee

    it('should allow assignee to update status of their task', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.MEMBER });
      (taskRepository.update as jest.Mock).mockResolvedValue({ ...mockTask, status: TaskStatus.IN_PROGRESS });

      const result = await taskService.updateStatus(10, TaskStatus.IN_PROGRESS, mockUserNormal);

      expect(taskRepository.update).toHaveBeenCalledWith(10, { status: TaskStatus.IN_PROGRESS });
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should throw ForbiddenError if non-assignee and non-owner normal user tries to update status', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      // Other user is MEMBER of the board, not OWNER, and not assigned to task
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserOther.id, role: BoardRole.MEMBER });

      await expect(taskService.updateStatus(10, TaskStatus.IN_PROGRESS, mockUserOther)).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError if user is board VIEWER, even if assigned to the task', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserNormal.id, role: BoardRole.VIEWER });

      await expect(taskService.updateStatus(10, TaskStatus.IN_PROGRESS, mockUserNormal)).rejects.toThrow(ForbiddenError);
    });

    it('should allow board OWNER to update task status even if not assigned', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockUserOther.id, role: BoardRole.OWNER });
      (taskRepository.update as jest.Mock).mockResolvedValue({ ...mockTask, status: TaskStatus.IN_PROGRESS });

      const result = await taskService.updateStatus(10, TaskStatus.IN_PROGRESS, mockUserOther);

      expect(taskRepository.update).toHaveBeenCalled();
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('assignTask', () => {
    const mockTask = { id: 10, boardId: 1 };
    const mockCurrentUser = { id: 101, role: 'USER' as const };

    it('should assign task if assignee is a member of the board', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 200, name: 'Assignee' });
      (boardRepository.findMember as jest.Mock)
        .mockResolvedValueOnce({ userId: mockCurrentUser.id }) // Current user access check
        .mockResolvedValueOnce({ userId: 200 }); // Assignee access check
      
      (taskRepository.assignTask as jest.Mock).mockResolvedValue({ ...mockTask, assigneeId: 200 });

      const result = await taskService.assignTask(10, 200, mockCurrentUser);

      expect(taskRepository.assignTask).toHaveBeenCalledWith(10, 200);
      expect(result.assigneeId).toBe(200);
    });

    it('should throw BadRequestError if assignee is not a member of the board', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 200, name: 'Assignee' });
      (boardRepository.findMember as jest.Mock)
        .mockResolvedValueOnce({ userId: mockCurrentUser.id }) // Current user access check
        .mockResolvedValueOnce(null); // Assignee not a member
      
      await expect(taskService.assignTask(10, 200, mockCurrentUser)).rejects.toThrow(BadRequestError);
    });

    it('should throw ForbiddenError if current user is board VIEWER', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 200, name: 'Assignee' });
      (boardRepository.findMember as jest.Mock).mockResolvedValue({ userId: mockCurrentUser.id, role: BoardRole.VIEWER });

      await expect(taskService.assignTask(10, 200, mockCurrentUser)).rejects.toThrow(ForbiddenError);
    });

    it('should throw BadRequestError if assignee is a VIEWER of the board', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 200, name: 'Assignee' });
      (boardRepository.findMember as jest.Mock)
        .mockResolvedValueOnce({ userId: mockCurrentUser.id, role: BoardRole.MEMBER }) // Current user access check
        .mockResolvedValueOnce({ userId: 200, role: BoardRole.VIEWER }); // Assignee is viewer
      
      await expect(taskService.assignTask(10, 200, mockCurrentUser)).rejects.toThrow(BadRequestError);
    });
  });
});
