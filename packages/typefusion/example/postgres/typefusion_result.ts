import { pgType, TypefusionResult } from "../../src/index.js";

export default {
  name: "typefusion_result",
  resultDatabase: "postgresql",
  schema: {
    leaf: pgType.text().notNull(),
  },
  run: async () => {
    console.log("TYPEFUSION RESULT IS RUN");
    return [
      {
        leaf: "leafString",
      },
    ];
  },
} satisfies TypefusionResult<{ leaf: string }>;
