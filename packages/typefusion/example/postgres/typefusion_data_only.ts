import { typefusionRef, TypefusionScriptDataOnly } from "../../src/index.js";
import main from "../main.js";
import typefusionResult from "./typefusion_result.js";

export default {
  name: "typefusion_data_only",
  resultDatabase: "postgresql",
  run: async () => {
    const mainResult = await typefusionRef(main);
    const leafResult = await typefusionRef(typefusionResult);

    console.log("TYPEFUSION DATA ONLY IS RUN", mainResult, leafResult);
    return {
      data: [
        {
          dataOnly: "dataOnlyString",
        },
      ],
    };
  },
} satisfies TypefusionScriptDataOnly<{ dataOnly: string }>;
