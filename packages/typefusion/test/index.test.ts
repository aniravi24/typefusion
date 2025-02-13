import { it as itE } from "@effect/vitest";
import { describe, it } from "vitest";

import typefusionEffect from "../src/effect.js";
import typefusion from "../src/index.js";

const typefusionConfig = {
  alwaysPrintExecutionGraph: true,
  directory: "./test/examplejs/example",
  ignoreGlob: ["**/src/**"],
  verbose: false,
};

describe("typefusion", () => {
  itE.effect("should run effect successfully", () =>
    typefusionEffect(typefusionConfig),
  );

  it("should run successfully", async () => typefusion(typefusionConfig));
});
