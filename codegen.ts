import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",

  generates: {
    "./src/generated/schema.ts": {
      plugins: ["typescript"],

      config: {
        scalars: {
          ID: {
            input: "number",
            output: "number",
          },
        },

        enumValues: {
          Role: "@prisma/client#Role",
          TaskStatus: "@prisma/client#TaskStatus",
          TaskPriority: "@prisma/client#TaskPriority",
        },
      },
    },

    "./src/generated/resolvers.ts": {
      plugins: ["typescript-resolvers"],

      config: {
        contextType: "../graphql/context#GraphQLContext",
        namespacedImportName: "Types",

        useTypeImports: true,

        mappers: {
          User: "@prisma/client#User",
          Board: "@prisma/client#Board",
          Task: "@prisma/client#Task",
        },

        scalars: {
          ID: {
            input: "number",
            output: "number",
          },
        },

        enumValues: {
          Role: "@prisma/client#Role",
          TaskStatus: "@prisma/client#TaskStatus",
          TaskPriority: "@prisma/client#TaskPriority",
        },
      },
    },
  },

  ignoreNoDocuments: true,

  hooks: {
    afterOneFileWrite: ["node scripts/fix-codegen.js"],
  },
};

export default config;