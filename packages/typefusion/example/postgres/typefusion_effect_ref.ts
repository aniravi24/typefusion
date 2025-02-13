import { Effect } from "effect";

import { TypefusionDbScriptEffect } from "../../src/effect.js";
import { pgType } from "../../src/index.js";
import { typefusionRefEffect } from "../../src/lib.js";
import mainEffect from "../main_effect.js";

const smallSchema = {
  small: pgType.text().notNull(),
};

export default {
  name: "typefusion_effect_ref",
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
  schema: smallSchema,
} satisfies TypefusionDbScriptEffect<typeof smallSchema>;
