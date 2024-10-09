import { Effect } from "effect";
import { pgType } from "../src/db/postgres/types.js";
import { TypefusionDbScriptEffect } from "../src/effect.js";

export const mainSchema = {
  id: pgType.integer().notNull(),
  name: pgType.text().notNull(),
  age: pgType.integer().notNull(),
  email: pgType.text().notNull(),
  address: pgType.text().notNull(),
};

export default {
  name: "main_effect",
  schema: mainSchema,
  resultDatabase: "postgresql",
  runEffect: () => {
    console.log("MAIN IS RUN");
    return Effect.succeed({
      data: [
        {
          id: 1,
          name: "John Doe",
          age: 30,
          email: "john.doe@example.com",
          address: "123 Main St",
        },
      ],
    });
  },
} satisfies TypefusionDbScriptEffect<typeof mainSchema>;
