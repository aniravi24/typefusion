import {
  typefusionRef,
  TypefusionDbScript,
  clickhouseType,
} from "../../src/index.js";
import main from "../main.js";

const smallSchema = {
  small: clickhouseType.string().notNull(),
};

export default {
  name: "typefusion_clickhouse_result",
  resultDatabase: "clickhouse",
  schema: smallSchema,
  run: async () => {
    const result = await typefusionRef(main);
    console.log("TYPEFUSION CLICKHOUSE RESULT IS RUN", result);
    return {
      data: [
        {
          small: "smallString" as const,
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof smallSchema>;
