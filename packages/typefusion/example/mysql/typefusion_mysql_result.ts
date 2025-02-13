import {
  mySqlType,
  TypefusionDbScript,
  typefusionRef,
} from "../../src/index.js";
import main from "../main.js";

const smallSchema = {
  small: mySqlType.text().notNull(),
};

export default {
  name: "typefusion_mysql_result",
  resultDatabase: "mysql",
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
  schema: smallSchema,
} satisfies TypefusionDbScript<typeof smallSchema>;
