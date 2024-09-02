import { Schema } from "@effect/schema";
import { Effect, Data } from "effect";
import { TypefusionModule, TypefusionModuleDefault } from "./types.js";
import { SqlClient } from "@effect/sql";
import {
  PgType,
  postgresIdColumn,
  valueToPostgresType,
} from "./db/postgres/types.js";

// TODO this file needs to be generalized so we can support other databases

// For some reason when we dynamically import the PgType when executing scripts, somePgType instanceof PgType is false
const PgTypeSchema = Schema.declare(<T>(input: unknown): input is PgType<T> => {
  if (typeof input === "object" && input !== null) {
    return "_tag" in input && input["_tag"] === "PgType";
  }
  return false;
});

/**
 * The schema for the return type of a Typefusion script.
 */
const ScriptResultSchema = Schema.Struct({
  types: Schema.Record({
    key: Schema.String,
    value: PgTypeSchema,
  }).pipe(Schema.optional),
  data: Schema.Record({ key: Schema.String, value: Schema.Unknown }).pipe(
    Schema.Array,
  ),
});

/**
 * The return type of a Typefusion script.
 */
export type TypefusionScriptResult = Schema.Schema.Type<
  typeof ScriptResultSchema
>;

/**
 * The return type of a Typefusion script ({@link TypefusionScriptResult}) when the result contains only the 'data' field.
 */
export interface TypefusionResultDataOnly<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptResult {
  types?: {
    [key in keyof DataElement]: PgType<DataElement[key]>;
  };
  data: DataElement[];
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptResult}) when the result contains both the 'types' and 'data' fields, and you want to use your existing {@link PgType} schema.
 */
export interface TypefusionPgResult<T extends Record<string, PgType<unknown>>>
  extends TypefusionScriptResult {
  types: T;
  data: {
    [key in keyof T]: T[key] extends PgType<infer U> ? U : never;
  }[];
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptResult}) when the result contains both the 'types' and 'data' fields, and you want to use your existing {@link PgType} schema.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export interface TypefusionPgResultDataUnknown<
  T extends Record<string, PgType<unknown>>,
> extends TypefusionScriptResult {
  types: T;
  data: Record<any, any>[];
}
/**
 * The return type of a Typefusion script ({@link TypefusionScriptResult}) when the result contains both the 'types' and 'data' fields.
 * This will check that your `pgType` schema matches the data you are returning, but it's more verbose than using {@link TypefusionPgResult}.
 */

export interface TypefusionResult<DataElement extends Record<string, unknown>>
  extends TypefusionScriptResult {
  types: {
    [key in keyof DataElement]: PgType<DataElement[key]>;
  };
  data: DataElement[];
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptResult}) when the result contains potentially only the 'data' field.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export interface TypefusionResultUnknown
  extends TypefusionResult<Record<string, unknown>> {}

export class ConvertDataToSQLDDLError extends Data.TaggedError(
  "ConvertDataToSQLDDLError",
)<{
  cause: unknown;
  message: string;
}> {}

// TODO support multiple casings? (camelCase, snake_case)
const convertTypefusionScriptResultToSQLDDL = (
  module: TypefusionModule,
  result: TypefusionScriptResult,
) =>
  Effect.gen(function* () {
    if (!result.types || Object.keys(result.types).length === 0) {
      if (result.data.length === 0) {
        yield* Effect.fail(
          new ConvertDataToSQLDDLError({
            cause: null,
            message: `Your data for script '${module.name}' is empty, please add types for module '${module.name}'. We can't infer the database types from an empty result.`,
          }),
        );
      }
      yield* Effect.logDebug(
        `No database types provided for module '${module.name}', inferring from first item in result data.`,
      );
      // If an ID column is not explicitly provided, we will assume you don't want a primary key
      return yield* Effect.forEach(
        Object.entries(result.data[0]),
        ([key, value]) =>
          Effect.if(key === "id", {
            onTrue: () => Effect.succeed(postgresIdColumn()),
            onFalse: () =>
              Effect.map(
                valueToPostgresType(value),
                (pgType) => `"${key}" ${pgType}`,
              ),
          }),
        { concurrency: "inherit" },
      ).pipe(Effect.map((col) => col.join(", ")));
    }
    // If an ID column is not explicitly provided, we will assume you don't want a primary key
    return Object.entries(result.types)
      .map(([key, value]) => {
        if (key === "id") {
          return postgresIdColumn(value);
        }
        return `"${key}" ${value}`;
      })
      .join(", ");
  });

export class DatabaseInsertError extends Data.TaggedError(
  "DatabaseInsertError",
)<{
  cause: unknown;
  message: string;
}> {}

export const dbInsert = (module: TypefusionModule, result: unknown) =>
  Effect.gen(function* () {
    const resultIsValidSchema = Schema.is(ScriptResultSchema)(result);
    if (resultIsValidSchema) {
      const sql = yield* SqlClient.SqlClient;

      yield* sql`DROP TABLE IF EXISTS "${sql.unsafe(module.name)}"`.pipe(
        Effect.mapError(
          (error) =>
            new DatabaseInsertError({
              cause: error,
              message: `Error dropping table '${module.name}'`,
            }),
        ),
      );

      const columnDefinitions = yield* convertTypefusionScriptResultToSQLDDL(
        module,
        result,
      );

      yield* Effect.logDebug("columnDefinitions\n", columnDefinitions);

      yield* sql`CREATE TABLE IF NOT EXISTS "${sql.unsafe(module.name)}" (
        ${sql.unsafe(columnDefinitions)}
      )`.pipe(
        Effect.mapError(
          (error) =>
            new DatabaseInsertError({
              cause: error,
              message: `Error creating table '${module.name}'`,
            }),
        ),
      );

      // Note: We cast here because we are going to avoid validating each value in the result as the proper type, we'll let the database fail if the types are incorrect
      yield* sql`INSERT INTO "${sql.unsafe(module.name)}" ${sql.insert(result.data as Parameters<typeof sql.insert>[0][])}`.pipe(
        Effect.mapError(
          (error) =>
            new DatabaseInsertError({
              cause: error,
              message: `Error inserting data into '${module.name}'`,
            }),
        ),
      );
    } else {
      yield* Effect.logError("Invalid script result: ", result);
      yield* Effect.fail(
        new DatabaseInsertError({
          cause: null,
          message: `Module '${module.name}' does not match expected schema, make sure your function returns an object with the following shape: ${ScriptResultSchema.toString()}`,
        }),
      );
    }
  });

export class DatabaseSelectError extends Data.TaggedError(
  "DatabaseSelectError",
)<{
  cause: unknown;
  message: string;
}> {}

export const dbSelect = (module: TypefusionModuleDefault) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    return yield* sql`SELECT * FROM "${sql.unsafe(module.name)}"`.pipe(
      Effect.mapError(
        (error) =>
          new DatabaseSelectError({
            cause: error,
            message: `Error fetching data from ${module.name}`,
          }),
      ),
    );
  });
