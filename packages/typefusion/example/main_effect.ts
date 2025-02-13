import { Effect } from "effect";

import { pgType } from "../src/db/postgres/types.js";
import { TypefusionDbScriptEffect } from "../src/effect.js";

export const mainSchema = {
  address: pgType.text().notNull(),
  age: pgType.integer().notNull(),
  email: pgType.text().notNull(),
  id: pgType.integer().notNull(),
  name: pgType.text().notNull(),
};

export default {
  name: "main_effect",
  resultDatabase: "postgresql",
  runEffect: () => {
    console.log("MAIN IS RUN");
    return Effect.succeed({
      data: [
        {
          address: "123 Main St",
          age: 30,
          email: "john.doe@example.com",
          id: 1,
          name: "John Doe",
        },
      ],
    });
  },
  schema: mainSchema,
} satisfies TypefusionDbScriptEffect<typeof mainSchema>;
