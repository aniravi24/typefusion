import { Effect } from "effect";
import { DatabaseGetError, dbSelect, TypefusionScriptResult } from "./store.js";
import { SqlLive } from "./db/postgres/client.js";
import { ConfigError } from "effect/ConfigError";

export const typefusionRef = async <
  T extends (...args: any[]) => PromiseLike<TypefusionScriptResult>,
>(
  module: T,
): Promise<
  "types" extends keyof Awaited<ReturnType<T>>
    ? {
        [K in keyof Awaited<ReturnType<T>>["types"]]: Awaited<
          ReturnType<T>
        >["types"][K] extends { getType: () => infer R }
          ? R
          : never;
      }
    : Awaited<ReturnType<T>>["data"] extends Array<infer U>
      ? U
      : never
> => {
  return dbSelect(module).pipe(
    Effect.provide(SqlLive),
    Effect.runPromise,
  ) as any;
};

export const typefusionRefEffect = <
  T extends (...args: any[]) => PromiseLike<TypefusionScriptResult>,
>(
  module: T,
): Effect.Effect<
  "types" extends keyof Awaited<ReturnType<T>>
    ? {
        [K in keyof Awaited<ReturnType<T>>["types"]]: Awaited<
          ReturnType<T>
        >["types"][K] extends { getType: () => infer R }
          ? R
          : never;
      }
    : Awaited<ReturnType<T>>["data"] extends Array<infer U>
      ? U
      : never,
  DatabaseGetError | ConfigError
> => {
  return dbSelect(module).pipe(Effect.provide(SqlLive)) as any;
};

/**
 * Get the table name of a module. This can be used when you want to grab the table name without getting the full data.
 * @param module - The module to get the table name from.
 * @returns The table name.
 */
export const typefusionRefTableName = async <
  T extends (...args: any[]) => PromiseLike<TypefusionScriptResult>,
>(
  module: T,
): Promise<string> => {
  // Currently the function name is the table name
  return module.name;
};

export const typefusionRefTableNameEffect = <
  T extends (...args: any[]) => PromiseLike<TypefusionScriptResult>,
>(
  module: T,
): Effect.Effect<string, ConfigError> => {
  return Effect.succeed(module.name);
};
