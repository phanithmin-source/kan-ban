import { baseTypeDefs } from "./base.schema.js";
import { boardTypeDefs } from "../modules/board/board.schema.js";
import { taskTypeDefs } from "../modules/task/task.schema.js";
import { userTypeDefs } from "../modules/user/index.js";
import { authTypeDefs } from "../modules/auth/auth.schema.js";

export const typeDefs = `#graphql

${baseTypeDefs}

${taskTypeDefs}

${boardTypeDefs}

${userTypeDefs}

${authTypeDefs}
`;