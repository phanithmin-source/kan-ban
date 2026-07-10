# ⚙️ Kanban Task Manager — Backend

A GraphQL backend for the Kanban task manager built with **TypeScript**, **Express**, **Apollo Server v5**, **Prisma ORM**, and **PostgreSQL**.

This repository uses a modular architecture with a clear separation between the GraphQL schema/resolvers, business services, validation layer, and database access logic.

---

## 🚀 Features

### Authentication & Authorization
* **JWT Authentication**: Secure stateless token issuance and verification.
* **Role-Based Access Control (RBAC)**: App-wide roles (`ADMIN`, `MANAGER`, `USER`) gate resolver operations.
* **Board Permissions**: Board-specific roles (`OWNER`, `MEMBER`, `VIEWER`) govern card modifications and member additions.

### Operations
* **User Management**: Creation, profile lookups, updates, and role reassignment.
* **Board Management**: Full CRUD operations with membership and ownership enforcement.
* **Task Management**: Creating, updating, deleting, transition statuses, assigning tasks, due date supports, and custom commenting.
* **Filtering & Pagination**: Advanced server-side task search with page, limit, priority, and status sorting.

### Validation & Errors
* **Data Validation**: Strict input type and schema verification powered by Zod.
* **Error Handling**: Standardized error mappings back to GraphQL clients.

---

## 🛠️ Technology Stack

* **Runtime & Compiler**: Node.js (v18+), [TypeScript](file:///c:/Users/minph/Documents/kanban-task-manager/backend/tsconfig.json) (v5.9.2)
* **API Layer**: Express (v5.2.1), Apollo Server (v5.5.1), GraphQL (v16.14.2)
* **Database & ORM**: PostgreSQL, Prisma ORM (v6.19.3)
* **Security & Auth**: jsonwebtoken (v9.0.3), bcrypt (v6.0.0)
* **Validation**: Zod (v4.4.3)
* **Testing**: Jest (v30.4.2), Supertest (v7.2.2), ts-jest (v29.4.11)

For a complete dependency checklist, see the [backend/package.json](file:///c:/Users/minph/Documents/kanban-task-manager/backend/package.json).

---

## 🗂️ Project Structure

The codebase is organized into modules by domain (auth, board, task, user). Each module houses its logic in a clean layer (resolvers, services, repositories).

```text
src/
├── config/                  # App configurations & database initializers
│   ├── env.ts
│   └── prisma.ts
├── generated/               # Auto-generated GraphQL TypeScript schemas
│   └── graphql.ts
├── graphql/                 # Base type definitions and resolver bootstrap
│   ├── base.schema.ts
│   ├── context.ts
│   ├── resolvers.ts
│   └── typeDefs.ts
├── modules/                 # Modular domain logic
│   ├── auth/                # Auth schemas, services, and repositories
│   ├── board/               # Board schemas, services, and repositories
│   ├── task/                # Task/Comment schemas, services, and repositories
│   └── user/                # User schemas, services, and repositories
├── test/                    # Service-layer integration tests
│   ├── auth.service.test.ts
│   ├── board.service.test.ts
│   ├── task.service.test.ts
│   └── user.service.test.ts
├── utils/                   # Shared error definitions and security helpers
│   └── errors.ts
├── app.ts                   # Express & Apollo Server setup
└── server.ts                # Application boot entrypoint
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
Run the installation command in the `backend/` directory:
```bash
npm install
```

### 2. Configure Environment Variables
Copy [.env.example](file:///c:/Users/minph/Documents/kanban-task-manager/backend/.env.example) to `.env`:
```bash
cp .env.example .env
```
Ensure your configuration points to your PostgreSQL instance:
```env
PORT=4000
DATABASE_URL="postgresql://admin:cHJvcGVyeW91bmdlcmV4YWN0bHlzaGFraW5nc2hvdG15c3RlcmlvdXNjdXN0b21zYmU=@localhost:5432/kan-ban?schema=public"
JWT_SECRET=your-secure-jwt-secret-key-here
```

### 3. Run PostgreSQL via Docker (Optional)
A local PostgreSQL instance can be started instantly using the provided [docker-compose.yml](file:///c:/Users/minph/Documents/kanban-task-manager/backend/docker-compose.yml):
```bash
docker-compose up -d
```
This launches a database accessible on port `5432` with username `admin` and database `kan-ban`.

### 4. Database Migrations
Run the schema migrations to update the database state and output the client definitions:
```bash
# Generate Prisma Client code bindings
npm run db:generate

# Apply migrations to your Postgres instance
npm run db:migrate
```

### 5. Seed Mock Data
Execute the seed script to populate mock boards, tasks, comments, and role-based users:
```bash
npx tsx prisma/seed.ts
```
* **Password**: All default accounts use the password `Password123`
* **Admin**: `admin@test.com`
* **Managers**: `manager1@test.com` to `manager3@test.com`
* **Users**: `user1@test.com` to `user16@test.com`

---

## 🚀 Running the Server

Start the development server with watch compilation enabled:
```bash
npm run dev
```
The server will bind to the configured port (default `4000`).
* **GraphQL Explorer (Apollo Sandbox)**: `http://localhost:4000/graphql`

---

## 🧪 Running Tests

The test suite runs integration-style unit tests against services using mocked Prisma endpoints. Booting a separate database is not required.

To run the full Jest test suite:
```bash
npm test
```

---

## ⚡ GraphQL Reference

### Queries
```graphql
type Query {
  me: User!
  users: [User!]!
  boards: [Board!]!
  board(id: ID!): Board
  tasks(filter: TaskFilterInput): TaskConnection!
  task(id: ID!): Task
}
```

### Mutations
```graphql
type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  refreshToken(token: String!): AuthPayload!
  createBoard(input: CreateBoardInput!): Board!
  updateBoard(id: ID!, input: UpdateBoardInput!): Board!
  deleteBoard(id: ID!): Board!
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Task!
  updateTaskStatus(id: ID!, status: TaskStatus!): Task!
  assignTask(taskId: ID!, userId: ID!): Task!
  addComment(taskId: ID!, content: String!): Comment!
  updateComment(id: ID!, content: String!): Comment!
  deleteComment(id: ID!): Comment!
}
```
