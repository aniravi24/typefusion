import {
  typefusionRef,
  TypefusionDbScript,
  clickhouseType,
} from "../../src/index.js";
import typefusion_clickhouse_result from "./typefusion_clickhouse_result.js";

const bigSchema = {
  big: clickhouseType.string().notNull(),
};

export default {
  name: "typefusion_clickhouse_ref",
  resultDatabase: "clickhouse",
  schema: bigSchema,
  run: async () => {
    const result = await typefusionRef(typefusion_clickhouse_result);
    console.log("TYPEFUSION CLICKHOUSE REF IS RUN", result);
    return {
      data: [
        {
          big: "bigString" as const,
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof bigSchema>;
