import {
  typefusionRef,
  TypefusionDbScript,
  mySqlType,
} from "../../src/index.js";
import main from "../main.js";

const smallSchema = {
  small: mySqlType.text().notNull(),
};

export default {
  name: "typefusion_mysql_result",
  resultDatabase: "mysql",
  schema: smallSchema,
  run: async () => {
    const result = await typefusionRef(main);
    console.log("TYPEFUSION MYSQL RESULT IS RUN", result);
    return {
      data: [
        {
          small: "smallString" as const,
        },
      ],
    };
  },
} satisfies TypefusionDbScript<typeof smallSchema>;
