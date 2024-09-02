import { Data, Effect } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import skott from "skott";
import { traverseGraph, printExecutionGraph, runModule } from "./helpers.js";
import { SqlLive } from "./db/postgres/client.js";

export const DependencyGraphGenerationError = Data.TaggedError(
  "DependencyGraphGenerationError",
)<{
  cause: unknown;
  message: string;
}>;

export interface TypefusionConfig {
  directory: string;
  ignoreGlob: string[];
  verbose: boolean;
  alwaysPrintExecutionGraph?: boolean;
}

/**
 * The main entry point for Typefusion. This function will generate a dependency graph of the modules in the given directory,
 * and then execute the modules in the order of their dependencies.
 *
 * @param config - The configuration for Typefusion, see {@link TypefusionConfig}.
 * @returns An Effect that, when run, will execute the Typefusion script.
 */
export function typefusion(config: TypefusionConfig) {
  return Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;

    const absolutePath = yield* fileSystem.realPath(
      process.cwd() + "/" + config.directory,
    );

    const { useGraph, getStructure } = yield* Effect.tryPromise({
      try: async () =>
        skott({
          verbose: config.verbose,
          cwd: absolutePath,
          fileExtensions: [".js"],
          ignorePatterns: config.ignoreGlob,
        }),
      catch: (error) =>
        new DependencyGraphGenerationError({
          cause: error,
          message: `Error generating the dependency graph. Please open an issue at https://github.com/aniravi24/typefusion/issues.`,
        }),
    });

    const { hasCircularDependencies, findCircularDependencies } = useGraph();

    if (hasCircularDependencies()) {
      yield* Effect.fail(
        `You cannot have circular dependencies in your graph.\n  ${findCircularDependencies()
          .map((cycle) => cycle.join(" -> "))
          .join("\n")}`,
      );
    }
    const { graph } = getStructure();

    yield* Effect.logDebug("executionGraph", graph);

    const executionLevels = traverseGraph(graph);
    yield* printExecutionGraph(
      executionLevels,
      config.alwaysPrintExecutionGraph,
    );

    for (const level of executionLevels) {
      yield* Effect.forEach(level, (file) => runModule(file), {
        concurrency: "inherit",
      });
    }
  }).pipe(Effect.provide(SqlLive), Effect.provide(NodeFileSystem.layer));
}
