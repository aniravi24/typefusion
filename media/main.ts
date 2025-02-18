import { pgType } from "../src/db/postgres/types.js";
import { TypefusionDbScript } from "../src/index.js";

export const mainSchema = {
  address: pgType.text().notNull(),
  age: pgType.integer().notNull(),
  email: pgType.text().notNull(),
  id: pgType.integer().notNull(),
  name: pgType.text().notNull(),
};

export default {
  name: "main",
  resultDatabase: "postgresql",
  run: async () => {
    console.log("MAIN IS RUN");
    return {
      data: [
        {
          address: "123 Main St",
          age: 30,
          email: "john.doe@example.com",
          id: 1,
          name: "John Doe",
        },
      ],
    };
  },
  schema: mainSchema,
} satisfies TypefusionDbScript<typeof mainSchema>;
