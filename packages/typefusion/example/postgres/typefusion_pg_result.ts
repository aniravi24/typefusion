import { pgType, TypefusionDbScript, typefusionRef } from "../../src/index.js";
import typefusionDataOnly from "./typefusion_data_only.js";

const smallSchema = {
  small: pgType.text().notNull(),
};

export default {
  name: "typefusion_pg_result",
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
  schema: smallSchema,
} satisfies TypefusionDbScript<typeof smallSchema>;
