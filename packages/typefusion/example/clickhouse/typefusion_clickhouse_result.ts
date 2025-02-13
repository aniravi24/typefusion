import {
  clickhouseType,
  TypefusionDbScript,
  typefusionRef,
} from "../../src/index.js";
import main from "../main.js";

const smallSchema = {
  small: clickhouseType.string().notNull(),
};

export default {
  name: "typefusion_clickhouse_result",
  resultDatabase: "clickhouse",
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
  schema: smallSchema,
} satisfies TypefusionDbScript<typeof smallSchema>;
