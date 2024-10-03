import { pgType } from "../../src/index.js";
import { typefusionRef } from "../../src/lib.js";
import main from "../main.js";

export default {
  name: "typefusion_no_types",
  schema: {
    noTypes: pgType.text(),
  },
  resultDatabase: "postgresql",
  run: async () => {
    const result = await typefusionRef(main);
    console.log("TYPEFUSION NO TYPES IS RUN", result);
    return {
      data: [
        {
          noTypes: "noTypesString" as const,
        },
      ],
    };
  },
};
