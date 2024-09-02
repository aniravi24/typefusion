/* eslint-disable @typescript-eslint/require-await */
import { describe, it } from "vitest";
import typefusion from "../src/index.js";
import typefusionEffect from "../src/effect.js";

import { it as itE } from "@effect/vitest";

const typefusionConfig = {
  directory: "./test/examplejs/example",
  ignoreGlob: ["**/src/**"],
  verbose: false,
  alwaysPrintExecutionGraph: true,
};

describe("typefusion", () => {
  itE.effect("should run effect successfully", () =>
    typefusionEffect(typefusionConfig),
  );

  it("should run successfully", async () => typefusion(typefusionConfig));
});
