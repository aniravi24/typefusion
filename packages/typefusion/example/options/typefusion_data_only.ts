import { typefusionRef, TypefusionResultDataOnly } from "../../src/index.js";
import main from "../main.js";
import typefusionResult from "./typefusion_result.js";

export default async function typefusion_data_only(): Promise<
  TypefusionResultDataOnly<{ dataOnly: string }>
> {
  const mainResult = await typefusionRef(main);
  const leafResult = await typefusionRef(typefusionResult);

  console.log("TYPEFUSION DATA ONLY IS RUN", mainResult, leafResult);
  return {
    data: [
      {
        dataOnly: "dataOnlyString" as const,
      },
    ],
  };
}
