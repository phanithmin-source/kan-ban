import "dotenv/config";

import { ApolloServer } from "@apollo/server";
import { unwrapResolverError } from "@apollo/server/errors";
import { expressMiddleware } from "@as-integrations/express5";

import app from "./app.js";
import { env } from "./config/env.js";
import { createContext } from "./graphql/context.js";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { AppError } from "./utils/errors.js";
import { schema } from "./graphql/schema.js";

let server: ApolloServer | null = null;
let apolloMiddleware: any = null;

const initServerPromise = (async () => {
  server = new ApolloServer({
    schema,
    formatError(formattedError, error) {
      const originalError = unwrapResolverError(error);

      if (originalError instanceof AppError) {
        return {
          ...formattedError,
          extensions: {
            ...formattedError.extensions,
            code: originalError.code,
            statusCode: originalError.statusCode,
          },
        };
      }

      if (process.env.NODE_ENV === "production") {
        return {
          message: "Internal server error",
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
          },
        };
      }

      return formattedError;
    },
  });

  await server.start();
  apolloMiddleware = expressMiddleware(server, {
    context: async ({ req, res }) => createContext({ req, res }),
  });
})();

const apolloHandler = async (req: any, res: any, next: any) => {
  try {
    await initServerPromise;
    apolloMiddleware(req, res, next);
  } catch (error) {
    next(error);
  }
};

app.use("/graphql", apolloHandler);

if (!process.env.VERCEL) {
  initServerPromise
    .then(() => {
      app.listen(env.PORT, () => {
        console.log(
          `🚀 Server running at http://localhost:${env.PORT}/graphql`
        );
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    });
}

export default app;