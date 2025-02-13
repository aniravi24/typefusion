import { pgType, TypefusionScript } from "../../src/index.js";

export default {
  name: "typefusion_result",
  resultDatabase: "postgresql",
  run: async () => {
    console.log("TYPEFUSION RESULT IS RUN");
    return {
      data: [
        {
          leaf: "leafString",
        },
      ],
    };
  },
  schema: {
    leaf: pgType.text().notNull(),
  },
} satisfies TypefusionScript<{ leaf: string }>;
