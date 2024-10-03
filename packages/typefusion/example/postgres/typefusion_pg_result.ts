import { pgType, typefusionRef, TypefusionDbScript } from "../../src/index.js";
import typefusionDataOnly from "./typefusion_data_only.js";

const smallSchema = {
  small: pgType.text().notNull(),
};

export default {
  name: "typefusion_pg_result",
  schema: smallSchema,
  resultDatabase: "postgresql",
  run: async () => {
    const result = await typefusionRef(typefusionDataOnly);
    console.log("TYPEFUSION PG RESULT IS RUN", result);
    return {
      data: [
        {
          small: "smallString" as const,
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof smallSchema>;
