import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PASSWORD = "Password123";
const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Seeding database...");

  // ------------------------
  // CLEAN OLD DATA
  // ------------------------
  await prisma.comment.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // ------------------------
  // USERS (20)
  // ------------------------
  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  const users = [];

  // 1 ADMIN
  users.push({
    email: "admin@test.com",
    name: "Admin User",
    role: Role.ADMIN,
    password: hashedPassword,
  });

  // 3 MANAGERS
  for (let i = 1; i <= 3; i++) {
    users.push({
      email: `manager${i}@test.com`,
      name: faker.person.fullName(),
      role: Role.MANAGER,
      password: hashedPassword,
    });
  }

  // 16 USERS
  for (let i = 1; i <= 16; i++) {
    users.push({
      email: `user${i}@test.com`,
      name: faker.person.fullName(),
      role: Role.USER,
      password: hashedPassword,
    });
  }

  const createdUsers = await prisma.user.createMany({
    data: users,
  });

  const allUsers = await prisma.user.findMany();

  // ------------------------
  // BOARDS (8)
  // ------------------------
  const boardNames = [
    "Backend API",
    "Frontend Web",
    "Mobile App",
    "DevOps",
    "UI/UX",
    "Marketing",
    "CRM",
    "Analytics",
  ];

  const boards = boardNames.map((name) => ({
    name,
    ownerId:
      allUsers[
        Math.floor(Math.random() * 4) // admin + managers only
      ].id,
  }));

  await prisma.board.createMany({ data: boards });
  const allBoards = await prisma.board.findMany();

  // ------------------------
  // BOARD MEMBERSHIPS
  // ------------------------
  const boardMembers: { boardId: number; userId: number; role: "OWNER" | "MEMBER" | "VIEWER" }[] = [];
  for (const board of allBoards) {
    // Owner is a member with OWNER role
    boardMembers.push({
      boardId: board.id,
      userId: board.ownerId,
      role: "OWNER",
    });

    // Add some random users as members
    const randomUsers = faker.helpers.arrayElements(
      allUsers.filter((u) => u.id !== board.ownerId),
      { min: 3, max: 7 }
    );
    for (const u of randomUsers) {
      boardMembers.push({
        boardId: board.id,
        userId: u.id,
        role: "MEMBER",
      });
    }
  }

  await prisma.boardMember.createMany({ data: boardMembers });

  // ------------------------
  // TASKS (100)
  // ------------------------
  const tasks = [];

  const statuses = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.DONE,
  ];

  const priorities = [
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
  ];

  for (let i = 0; i < 100; i++) {
    const board = faker.helpers.arrayElement(allBoards);
    const boardMembersForThisBoard = boardMembers.filter(bm => bm.boardId === board.id);

    // Pick creator from board members or owner
    const creatorId = boardMembersForThisBoard.length > 0
      ? faker.helpers.arrayElement(boardMembersForThisBoard).userId
      : board.ownerId;

    // Pick assignee from board members or null
    const assigneeId = Math.random() > 0.2
      ? (boardMembersForThisBoard.length > 0 ? faker.helpers.arrayElement(boardMembersForThisBoard).userId : board.ownerId)
      : null;

    tasks.push({
      title: faker.hacker.phrase(),
      description: faker.lorem.sentences(2),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.helpers.arrayElement(priorities),
      boardId: board.id,
      creatorId,
      assigneeId,
      dueDate: faker.date.soon({ days: 30 }),
    });
  }

  await prisma.task.createMany({ data: tasks });

  // ------------------------
  // COMMENTS
  // ------------------------
  const allTasks = await prisma.task.findMany();
  const comments = [];

  for (const task of allTasks) {
    // 50% chance to have comments
    if (Math.random() > 0.5) {
      const boardMembersForThisBoard = boardMembers.filter(bm => bm.boardId === task.boardId);
      const numComments = Math.floor(Math.random() * 3) + 1; // 1 to 3 comments

      for (let c = 0; c < numComments; c++) {
        const userId = boardMembersForThisBoard.length > 0
          ? faker.helpers.arrayElement(boardMembersForThisBoard).userId
          : task.creatorId;

        comments.push({
          content: faker.lorem.sentence(),
          taskId: task.id,
          userId,
        });
      }
    }
  }

  await prisma.comment.createMany({ data: comments });

  // ------------------------
  // SUMMARY
  // ------------------------
  console.log("\n=========================");
  console.log("🌱 Seed completed!");
  console.log("=========================");

  console.log("\nLOGIN ACCOUNTS:");
  console.log("Admin: admin@test.com / Password123");
  console.log("Managers: manager1-3@test.com / Password123");
  console.log("Users: user1-16@test.com / Password123");

  console.log("\n✔ Users: 20");
  console.log("✔ Boards: 8");
  console.log("✔ Tasks: 100");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });