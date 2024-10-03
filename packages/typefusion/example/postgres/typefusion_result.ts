import { pgType, TypefusionScript } from "../../src/index.js";

export default {
  name: "typefusion_result",
  resultDatabase: "postgresql",
  schema: {
    leaf: pgType.text().notNull(),
  },
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
} satisfies TypefusionScript<{ leaf: string }>;
