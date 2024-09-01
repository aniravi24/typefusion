import { pgType, TypefusionResult } from "../../src/index.js";

export default async function typefusion_result(): Promise<
  TypefusionResult<{ leaf: string }>
> {
  console.log("TYPEFUSION RESULT IS RUN");
  return {
    types: {
      leaf: pgType.text().notNull(),
    },
    data: [
      {
        leaf: "leafString",
      },
    ],
  };
}
