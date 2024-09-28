import { Effect } from "effect";
import { DatabaseSelectError, dbSelect } from "./store.js";
import { ConfigError } from "effect/ConfigError";
import { TypefusionScriptExport } from "./types.js";
import { PgLive } from "./db/postgres/client.js";
import { MySqlLive } from "./db/mysql/client.js";
/**
 * Get the data from a module (i.e. the result of one of your Typefusion scripts).
 * @param module - The module to get the data from.
 * @returns The data from the associated table for that module.
 */
export const typefusionRef = async <T extends TypefusionScriptExport>(
  module: T,
): Promise<
  "schema" extends keyof T
    ? {
        [K in keyof T["schema"]]: T["schema"][K] extends {
          getType: () => infer R;
        }
          ? R
          : never;
      }[]
    : Awaited<ReturnType<T["run"]>>
> => {
  if (module.resultDatabase === "postgresql") {
    return dbSelect(module).pipe(
      Effect.provide(PgLive),
      Effect.runPromise,
    ) as any;
  }
  if (module.resultDatabase === "mysql") {
    return dbSelect(module).pipe(
      Effect.provide(MySqlLive),
      Effect.runPromise,
    ) as any;
  } else {
    throw new Error(
      `Unsupported database type provided for module ${module.name}: ${module.resultDatabase}`,
    );
  }
};

/**
 * Analogous to {@link typefusionRef} but for use in Effect.
 */
export const typefusionRefEffect = <T extends TypefusionScriptExport>(
  module: T,
): Effect.Effect<
  "schema" extends keyof T
    ? {
        [K in keyof T["schema"]]: T["schema"][K] extends {
          getType: () => infer R;
        }
          ? R
          : never;
      }
    : Awaited<ReturnType<T["run"]>>,
  DatabaseSelectError | ConfigError
> => {
  if (module.resultDatabase === "postgresql") {
    return dbSelect(module).pipe(Effect.provide(PgLive)) as any;
  }
  if (module.resultDatabase === "mysql") {
    return dbSelect(module).pipe(Effect.provide(MySqlLive)) as any;
  } else {
    return Effect.dieMessage(
      `Unsupported database type provided for module ${module.name}: ${module.resultDatabase}`,
    );
  }
};

/**
 * Get the table name of a module. This can be used when you want to grab the table name without getting the full data.
 * @param module - The module to get the table name from.
 * @returns The table name.
 */
export const typefusionRefTableName = async <T extends TypefusionScriptExport>(
  module: T,
): Promise<string> => {
  return module.name;
};

/**
 * Analogous to {@link typefusionRefTableName} but for use in Effect.
 */
export const typefusionRefTableNameEffect = <T extends TypefusionScriptExport>(
  module: T,
): Effect.Effect<string, ConfigError> => {
  return Effect.succeed(module.name);
};
