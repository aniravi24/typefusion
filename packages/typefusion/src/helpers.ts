import { Data, Effect, LogLevel } from "effect";
import { SkottNode } from "skott/graph/node";
import { dbInsert } from "./store.js";

/**
 * Traverses a dependency graph and returns an array of execution levels.
 * Each level contains nodes that can be executed in parallel.
 *
 * @param graph - A record of nodes, where each node has adjacentTo dependencies
 * @returns An array of string arrays, each representing a level of execution
 */
export function traverseGraph<T>(
  graph: Record<string, SkottNode<T>>,
): string[][] {
  // Set to keep track of visited nodes
  const visited = new Set<string>();
  // Array to store execution levels
  const executionLevels: string[][] = [];

  while (true) {
    // Find all nodes that haven't been visited and whose dependencies have all been visited
    const currentLevel = Object.keys(graph).filter(
      (nodeId) =>
        !visited.has(nodeId) &&
        graph[nodeId].adjacentTo.every((depId) => visited.has(depId)),
    );

    // If no nodes are found, we've processed all nodes
    if (currentLevel.length === 0) break;

    // Add the current level to our execution levels
    executionLevels.push(currentLevel);
    // Mark all nodes in the current level as visited
    currentLevel.forEach((nodeId) => visited.add(nodeId));
  }

  // Return the array of execution levels
  return executionLevels;
}

export class ModuleImportError extends Data.TaggedError("ModuleImportError")<{
  cause: unknown;
  message: string;
}> {}

export class ModuleExecutionError extends Data.TaggedError(
  "ModuleExecutionError",
)<{
  cause: unknown;
  message: string;
}> {}

export function runModule(leaf: string) {
  return Effect.gen(function* () {
    const path = `../${leaf}`;

    const moduleDefault = yield* Effect.tryPromise({
      try: async () => import(path).then((module) => module.default),
      catch: (error) =>
        new ModuleImportError({
          cause: error,
          message: `Error importing module '${leaf}' using path '${path}'`,
        }),
    });
    const result = yield* Effect.tryPromise({
      try: async () => moduleDefault(),
      catch: (error) =>
        new ModuleExecutionError({
          cause: error,
          message: `Error executing module '${leaf}'`,
        }),
    });
    return yield* dbInsert(moduleDefault, result);
  });
}

/**
 * Prints a pretty representation of the execution graph.
 * @param executionLevels - Array of execution levels
 */
export const printExecutionGraph = (
  executionLevels: string[][],
  alwaysPrintExecutionGraph?: boolean,
) =>
  Effect.gen(function* () {
    yield* Effect.logWithLevel(
      alwaysPrintExecutionGraph ? LogLevel.Info : LogLevel.Debug,
      "Execution Graph:",
    );
    for (const [index, level] of executionLevels.entries()) {
      yield* Effect.logWithLevel(
        alwaysPrintExecutionGraph ? LogLevel.Info : LogLevel.Debug,
        `Level ${index + 1}:`,
      );
      for (const node of level) {
        yield* Effect.logWithLevel(
          alwaysPrintExecutionGraph ? LogLevel.Info : LogLevel.Debug,
          `  ├─ ${node}`,
        );
      }
      if (index < executionLevels.length - 1) {
        yield* Effect.logWithLevel(
          alwaysPrintExecutionGraph ? LogLevel.Info : LogLevel.Debug,
          "  │",
        );
        yield* Effect.logWithLevel(
          alwaysPrintExecutionGraph ? LogLevel.Info : LogLevel.Debug,
          "  ▼",
        );
      }
    }
  });
