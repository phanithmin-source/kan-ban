export const taskTypeDefs = `#graphql
type Comment {
  id: ID!
  content: String!
  taskId: ID!
  userId: ID!
  createdAt: String!
  updatedAt: String!
  user: User!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  dueDate: String
  isArchived: Boolean!
  createdAt: String!
  updatedAt: String!

  board: Board!
  assignee: User
  creator: User!
  comments: [Comment!]!
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

enum TaskSortField {
  CREATED_AT
  UPDATED_AT
  DUE_DATE
  TITLE
  PRIORITY
}

enum SortOrder {
  ASC
  DESC
}

extend type Query {
  tasks(filter: TaskFilterInput): TaskConnection!
  task(id: ID!): Task
}

input TaskFilterInput {
  search: String
  status: TaskStatus
  priority: TaskPriority
  boardId: ID
  assigneeId: ID

  page: Int = 1
  limit: Int = 10

  sortBy: TaskSortField = CREATED_AT
  order: SortOrder = DESC
}

type TaskConnection {
  data: [Task!]!
  total: Int!
  page: Int!
  limit: Int!
  totalPages: Int!
}

input CreateTaskInput {
  boardId: ID!

  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  dueDate: String
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: TaskPriority
  dueDate: String
}

extend type Mutation {
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  updateTaskStatus(id: ID!, status: TaskStatus!): Task!

  assignTask(
    taskId: ID!
    userId: ID!
  ): Task!

  # Task Archiving
  archiveTask(id: ID!): Task!
  restoreTask(id: ID!): Task!

  # Comments Lifecycle
  addComment(taskId: ID!, content: String!): Comment!
  updateComment(id: ID!, content: String!): Comment!
  deleteComment(id: ID!): Boolean!
}
`;