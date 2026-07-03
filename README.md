# Kanban Task Manager Backend

A production-oriented GraphQL backend for a Kanban Task Manager built
with TypeScript, Express, Apollo Server, Prisma ORM, and SQLite.

This project follows a modular architecture with clear separation
between GraphQL resolvers, business logic, validation, and database
access. It is designed as a learning project while following
production-ready development practices.

------------------------------------------------------------------------

# Features

## Authentication

-   JWT Authentication
-   User Registration
-   User Login
-   Password Hashing (bcrypt)
-   Current User (`me`)
-   Protected GraphQL Operations
-   Role-Based Access Control (RBAC)

## User Management

-   Create User
-   Update User
-   Delete User
-   List Users
-   Get User by ID

## Board Management

-   Create Board
-   Update Board
-   Delete Board
-   List Boards
-   Board Ownership

## Task Management

-   Create Task
-   Update Task
-   Delete Task
-   Task Status
-   Task Priority
-   Due Date
-   Assign Task to User
-   Pagination, Filtering, Sorting (GraphQL TaskConnection)

## Validation

-   Zod Validation
-   Input Sanitization
-   Error Handling

------------------------------------------------------------------------

# Tech Stack

-   Node.js
-   TypeScript
-   Express
-   Apollo Server
-   GraphQL
-   Prisma ORM
-   SQLite
-   JWT
-   bcrypt
-   Zod

------------------------------------------------------------------------

# Project Structure

    src/
    ├── config/
    ├── graphql/
    ├── modules/
    │   ├── auth/
    │   ├── user/
    │   ├── board/
    │   └── task/
    ├── utils/
    ├── app.ts
    └── server.ts

------------------------------------------------------------------------

# Architecture

GraphQL Request → Resolver → Service → Repository → Prisma → Database

------------------------------------------------------------------------

## Setup Process

### 1. Clone repository

``` bash
git clone <repo-url>
cd kanban-task-manager
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Setup environment variables

Create `.env` file:

``` env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_secret_key
```

### 4. Prisma setup

``` bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run project

``` bash
npm run dev
```

------------------------------------------------------------------------

# GraphQL Features

## Queries

-   tasks (filter, pagination, sorting)
-   task(id)
-   boards
-   users
-   me

## Mutations

-   createTask
-   updateTask
-   deleteTask
-   updateTaskStatus
-   assignTask
-   createBoard
-   updateBoard
-   deleteBoard
-   register
-   login
-   logout

------------------------------------------------------------------------

# Authentication Flow

Client → JWT → Middleware → Context → Resolver → Service

------------------------------------------------------------------------

# Authorization

Roles: - ADMIN - MANAGER - USER

Helpers: - requireAuth - requireRole

------------------------------------------------------------------------

# Database

Entities: - User - Board - Task

Relations: - User → Boards - User → Assigned Tasks - Board → Tasks -
Task → Board + Assignee

------------------------------------------------------------------------

# Development Workflow

1.  Prisma Schema Update
2.  Migration
3.  Generate Client
4.  Repository Layer
5.  Service Layer
6.  Resolver Layer
7.  GraphQL Schema Update
8.  Testing in Apollo Sandbox
