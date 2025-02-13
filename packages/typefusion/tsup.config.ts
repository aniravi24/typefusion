import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  bundle: true,
  clean: !opts.watch,
  dts: true,
  entry: ["src/index.ts", "src/effect.ts", "src/cli.ts"],
  format: ["esm"],
  minify: !opts.watch,
}));
