#!/usr/bin/env node

import { Args, Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect, Option } from "effect";
import { typefusion } from "./typefusion.js";

const directory = Args.directory({ exists: "either" }).pipe(
  Args.withDescription("The directory where your scripts are stored."),
);

const ignoreGlob = Options.directory("ignore").pipe(
  Options.repeated,
  Options.optional,
);

const verbose = Options.boolean("verbose").pipe(Options.optional);

const command = Command.make(
  "typefusion",
  { directory, ignoreGlob, verbose },
  ({ directory, ignoreGlob, verbose }) =>
    typefusion({
      directory,
      ignoreGlob: Option.getOrElse(ignoreGlob, () => []),
      verbose: Option.getOrElse(verbose, () => false),
      alwaysPrintExecutionGraph: true,
    }),
);

const cli = Command.run(command, {
  name: "Typefusion CLI",
  version: "v0.0.1",
});

Effect.suspend(() => cli(process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain,
);
