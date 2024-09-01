/* eslint-disable @typescript-eslint/require-await */
import { describe, it } from "vitest";
import typefusion from "../src/index.js";

describe("typefusion", () => {
  it("should run successfully", async () =>
    typefusion({
      directory: "./test/examplejs/example",
      ignoreGlob: ["**/src/**"],
      verbose: false,
      alwaysPrintExecutionGraph: true,
    }));
});
