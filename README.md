# Kanban Task Manager Backend

A production-oriented GraphQL backend for a Kanban Task Manager built with TypeScript, Express, Apollo Server, Prisma ORM, and SQLite.

This project follows a modular architecture with clear separation between GraphQL resolvers, business logic, validation, and database access. It is designed as a learning project while following production-ready development practices.

---

# Features

## Authentication

- JWT Authentication
- User Registration
- User Login
- Password Hashing (bcrypt)
- Current User (`me`)
- Protected GraphQL Operations
- Role-Based Access Control (RBAC)

## User Management

- Create User
- Update User
- Delete User
- List Users
- Get User by ID

## Board Management

- Create Board
- Update Board
- Delete Board
- List Boards
- Board Ownership

## Task Management

- Create Task
- Update Task
- Delete Task
- Task Status
- Task Priority
- Due Date

## Validation

- Zod Validation
- Input Sanitization
- Error Handling

---

# Tech Stack

- Node.js
- TypeScript
- Express
- Apollo Server
- GraphQL
- Prisma ORM
- SQLite
- JWT
- bcrypt
- Zod

---

# Project Structure

```
src/
│
├── config/
│   ├── env.ts
│   └── prisma.ts
│
├── graphql/
│   ├── context.ts
│   ├── resolvers.ts
│   └── typeDefs.ts
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── board/
│   └── task/
│
├── utils/
│
├── app.ts
└── server.ts
```

Each feature is organized into its own module.

Example:

```
modules/
└── auth/
    ├── dto/
    ├── auth.repository.ts
    ├── auth.resolver.ts
    ├── auth.schema.graphql
    ├── auth.service.ts
    ├── auth.validation.ts
    └── index.ts
```

---

# Architecture

The project follows a layered architecture.

```
GraphQL Request
        │
        ▼
Resolver
        │
        ▼
Service
        │
        ▼
Repository
        │
        ▼
Prisma ORM
        │
        ▼
SQLite Database
```

---

## Resolver

Responsible for:

- GraphQL Queries
- GraphQL Mutations
- Calling Services

Contains **no business logic**.

---

## Service

Responsible for:

- Business Logic
- Validation
- Authorization
- Password Hashing
- JWT Generation

---

## Repository

Responsible for:

- Database Queries
- Prisma Operations

Contains **no business logic**.

---

# Database

The project uses Prisma ORM.

Current entities:

- User
- Board
- Task

Relationships:

```
User
 └── Boards

Board
 └── Tasks
```

---

# Authentication Flow

## Register

```
Client

↓

Validate Input

↓

Check Existing Email

↓

Hash Password

↓

Create User

↓

Generate JWT

↓

Return Token + User
```

---

## Login

```
Client

↓

Find User

↓

Compare Password

↓

Generate JWT

↓

Return Token + User
```

---

## Authenticated Request

```
Client

↓

Authorization Header

↓

JWT Middleware

↓

GraphQL Context

↓

Resolver

↓

Service
```

---

# Authorization

Role-Based Access Control (RBAC)

Current Roles

- ADMIN
- MANAGER
- USER

Authorization helpers

- requireAuth()
- requireRole()

---

# Validation

All request validation is handled using Zod.

Example:

- Login Validation
- Register Validation
- Board Validation
- Task Validation

---

# Error Handling

Custom errors are used throughout the application.

Examples:

- BadRequestError
- NotFoundError
- UnauthorizedError

---

# Environment Variables

Create a `.env` file:

```env
PORT=4000

DATABASE_URL="file:./dev.db"

JWT_SECRET=your_super_secret_key_at_least_32_characters
```

---

# Installation

Clone the repository

```bash
git clone <repository>
```

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

Start development server

```bash
npm run dev
```

GraphQL Playground

```
http://localhost:4000/graphql
```

---

# Development Workflow

1. Update Prisma Schema
2. Run Prisma Migration
3. Generate Prisma Client
4. Implement Repository
5. Implement Service
6. Implement Resolver
7. Update GraphQL Schema
8. Test in Apollo Sandbox

---
