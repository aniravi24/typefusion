import { pgType } from "../src/db/postgres/types.js";
import { TypefusionDbScript } from "../src/index.js";

export const mainSchema = {
  id: pgType.integer().notNull(),
  name: pgType.text().notNull(),
  age: pgType.integer().notNull(),
  email: pgType.text().notNull(),
  address: pgType.text().notNull(),
};

export default {
  name: "main",
  schema: mainSchema,
  resultDatabase: "postgresql",
  run: async () => {
    console.log("MAIN IS RUN");
    return {
      data: [
        {
          id: 1,
          name: "John Doe",
          age: 30,
          email: "john.doe@example.com",
          address: "123 Main St",
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof mainSchema>;
