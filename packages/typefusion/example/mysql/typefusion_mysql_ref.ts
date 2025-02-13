import {
  mySqlType,
  TypefusionDbScript,
  typefusionRef,
} from "../../src/index.js";
import typefusion_mysql_result from "./typefusion_mysql_result.js";

const bigSchema = {
  big: mySqlType.text().notNull(),
};

export default {
  name: "typefusion_mysql_ref",
  resultDatabase: "mysql",
  run: async () => {
    const result = await typefusionRef(typefusion_mysql_result);
    console.log("TYPEFUSION MYSQL REF IS RUN", result);
    return {
      data: [
        {
          big: "bigString" as const,
        },
      ],
    };
  },
  schema: bigSchema,
} satisfies TypefusionDbScript<typeof bigSchema>;
