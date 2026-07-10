# Kanban Task Manager Backend

A GraphQL backend for a Kanban task manager built with TypeScript,
Express, Apollo Server, Prisma ORM, and PostgreSQL.

This repository uses a modular architecture with clear separation
between GraphQL schema/resolvers, business services, validation,
and database access.

------------------------------------------------------------------------

# Features

## Authentication

- JWT-based authentication
- User registration
- User login
- Password hashing with bcrypt
- `me` query for current authenticated user
- Protected GraphQL operations
- Role-Based Access Control (RBAC)

## User Management

- List users
- Get user by ID
- Update user
- Delete user

## Board Management

- Create board
- Update board
- Delete board
- List accessible boards
- Board ownership enforcement

## Task Management

- Create task
- Update task
- Delete task
- Task status management
- Task priority management
- Due date support
- Assign task to user
- Task pagination, filtering, and sorting through GraphQL connection

## Validation and Error Handling

- Zod schema validation for input data
- Consistent GraphQL error mapping
- Custom application errors

------------------------------------------------------------------------

# Tech Stack

- Node.js
- TypeScript
- Express
- Apollo Server
- GraphQL
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod
- Jest
- Supertest

------------------------------------------------------------------------

# Project Structure

```text
src/
├── config/
│   ├── env.ts
│   └── prisma.ts
├── graphql/
│   ├── base.schema.ts
│   ├── context.ts
│   ├── resolvers.ts
│   └── typeDefs.ts
├── modules/
│   ├── auth/
│   ├── board/
│   ├── task/
│   └── user/
├── tests/
│   ├── auth.test.ts
│   ├── boards.test.ts
│   ├── tasks.test.ts
│   ├── users.test.ts
│   └── setup.ts
├── utils/
├── app.ts
└── server.ts
```

------------------------------------------------------------------------

# Architecture

GraphQL Request → Resolver → Service → Repository → Prisma → Database

------------------------------------------------------------------------

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file at the repository root with:

```env
PORT=4000
DATABASE_URL="postgresql://admin:cHJvcGVyeW91bmdlcmV4YWN0bHlzaGFraW5nc2hvdG15c3RlcmlvdXNjdXN0b21zYmU=@localhost:5432/kan-ban?schema=public"
JWT_SECRET=your-secure-32-char-minimum-secret
```

### 3. Optional: Run with Docker

If you prefer Docker, start the PostgreSQL service with:

```bash
docker-compose up -d
```

This project includes a `docker-compose.yml` that starts PostgreSQL on port `5432` with the following database settings:

- user: `admin`
- password: `cHJvcGVyeW91bmdlcmV4YWN0bHlzaGFraW5nc2hvdG15c3RlcmlvdXNjdXN0b21zYmU=`
- database: `kan-ban`

Then use the same `.env` values above to connect the app to the Docker database.

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed database with mock data

```bash
npx tsx prisma/seed.ts
```

*Note: This generates default accounts (Admin: `admin@test.com`, Managers: `manager1@test.com` to `manager3@test.com`, Users: `user1@test.com` to `user16@test.com`) with the password `Password123`.*

### 7. Start the application

```bash
npm run dev
```

The GraphQL endpoint will be available at:

```text
http://localhost:4000/graphql
```

------------------------------------------------------------------------

## Testing

The backend includes integration-style tests under `src/tests`.
The test helper boots the Apollo GraphQL schema in-process so tests
can run without a separate server process.

Run the test suite with:

```bash
npm test -- --runInBand
```

------------------------------------------------------------------------

# GraphQL API

## Queries

- `me`
- `users`
- `boards`
- `board(id: ID!)`
- `tasks(filter: TaskFilterInput)`
- `task(id: ID!)`

## Mutations

- `register(input: RegisterInput!)`
- `login(input: LoginInput!)`
- `logout`
- `refreshToken(token: String!)`
- `createBoard(input: CreateBoardInput!)`
- `updateBoard(id: ID!, input: UpdateBoardInput!)`
- `deleteBoard(id: ID!)`
- `createTask(input: CreateTaskInput!)`
- `updateTask(id: ID!, input: UpdateTaskInput!)`
- `deleteTask(id: ID!)`
- `updateTaskStatus(id: ID!, status: TaskStatus!)`
- `assignTask(taskId: ID!, userId: ID!)`

------------------------------------------------------------------------

# Authentication and Authorization

- Uses JWT tokens in the `Authorization: Bearer <token>` header.
- Protected resolvers validate the current user in context.
- `requireRole` enforces ADMIN/MANAGER access where needed.

------------------------------------------------------------------------

# Database

Models:

- `User`
- `Board`
- `Task`
- `RefreshToken`

Relationships:

- User owns boards
- User can be assigned tasks
- Board contains tasks
- Task belongs to a board

------------------------------------------------------------------------

# Notes

- The current test configuration uses `ts-jest` with a CommonJS transform
  for TypeScript test files.
- GraphQL input shapes require mutations to use `input: { ... }`,
  e.g. `login(input: { email: "...", password: "..." })`.
- JWT refresh tokens are persisted in the database and replaced on each login.
