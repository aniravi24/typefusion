import { pgType } from "../../src/index.js";
import { typefusionRef } from "../../src/lib.js";
import main from "../main.js";

export default async function typefusion_no_types() {
  const result = await typefusionRef(main);
  console.log("TYPEFUSION NO TYPES IS RUN", result);
  return {
    types: {
      noTypes: pgType.text(),
    },
    data: [
      {
        noTypes: "noTypesString" as const,
      },
    ],
  };
}
