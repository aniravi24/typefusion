import { Effect } from "effect";
import { pgType } from "../../src/index.js";
import { typefusionRefEffect } from "../../src/lib.js";
import { TypefusionDbScriptEffect } from "../../src/store.js";
import mainEffect from "../main_effect.js";
const smallSchema = {
  small: pgType.text().notNull(),
};

export default {
  name: "typefusion_effect_ref",
  schema: smallSchema,
  resultDatabase: "postgresql",
  runEffect: () =>
    Effect.gen(function* () {
      const result = yield* typefusionRefEffect(mainEffect);
      console.log("TYPEFUSION EFFECT REF IS RUN", result);
      return {
        data: [
          {
            small: "smallString" as const,
          },
        ],
      };
    }),
} satisfies TypefusionDbScriptEffect<typeof smallSchema>;
