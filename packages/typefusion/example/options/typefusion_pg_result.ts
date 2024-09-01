import { pgType, typefusionRef, TypefusionPgResult } from "../../src/index.js";
import typefusionDataOnly from "./typefusion_data_only.js";

const smallSchema = {
  small: pgType.text().notNull(),
};

export default async function typefusion_pg_result(): Promise<
  TypefusionPgResult<typeof smallSchema>
> {
  const result = await typefusionRef(typefusionDataOnly);
  console.log("TYPEFUSION PG RESULT IS RUN", result);
  return {
    types: smallSchema,
    data: [
      {
        small: "smallString" as const,
      },
    ],
  };
}
