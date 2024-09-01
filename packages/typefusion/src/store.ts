import { Schema } from "@effect/schema";
import { Effect, Data } from "effect";
import { TypefusionModule, TypefusionModuleDefault } from "./types.js";
import { SqlClient } from "@effect/sql";
import { PgType } from "./db/postgres/types.js";

// For some reason when we dynamically import the PgType when executing scripts, somePgType instanceof PgType is false
const PgTypeSchema = Schema.declare(<T>(input: unknown): input is PgType<T> => {
  if (typeof input === "object" && input !== null) {
    return "_type" in input && input["_type"] === "PgType";
  }
  return false;
});
const ScriptResultSchema = Schema.Struct({
  types: Schema.Record({
    key: Schema.String,
    value: PgTypeSchema,
  }).pipe(Schema.optional),
  data: Schema.Record({ key: Schema.String, value: Schema.Unknown }).pipe(
    Schema.Array,
  ),
});

export type TypefusionScriptResult = Schema.Schema.Type<
  typeof ScriptResultSchema
>;

export interface TypefusionResultDataOnly<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptResult {
  types?: {
    [key in keyof DataElement]: PgType<DataElement[key]>;
  };
  data: DataElement[];
}

export interface TypefusionPgResult<T extends Record<string, PgType<unknown>>>
  extends TypefusionScriptResult {
  types: T;
  data: {
    [key in keyof T]: T[key] extends PgType<infer U> ? U : never;
  }[];
}

export interface TypefusionResult<DataElement extends Record<string, unknown>>
  extends TypefusionScriptResult {
  types: {
    [key in keyof DataElement]: PgType<DataElement[key]>;
  };
  data: DataElement[];
}

export interface TypefusionResultUnknown
  extends TypefusionResult<Record<string, unknown>> {}

export class UnsupportedTypeError extends Data.TaggedError(
  "UnsupportedTypeError",
)<{
  cause: unknown;
  message: string;
}> {}

// People shouldn't really use this function, it's only useful for the simplest of types
const valueToPostgresType = (value: unknown) =>
  Effect.gen(function* () {
    if (value === null || value === undefined) {
      return "TEXT";
    }
    if (value instanceof Date) {
      return "TIMESTAMP WITH TIME ZONE";
    }
    if (typeof value === "object") {
      return "JSONB";
    }
    if (typeof value === "string") {
      return "TEXT";
    }
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        // PostgreSQL INTEGER range: -2,147,483,648 to +2,147,483,647
        const MIN_INTEGER = -2147483648;
        const MAX_INTEGER = 2147483647;
        if (value >= MIN_INTEGER && value <= MAX_INTEGER) {
          return "INTEGER";
        }
        return "BIGINT";
      }
      return "DOUBLE PRECISION";
    }
    if (typeof value === "boolean") {
      return "BOOLEAN";
    }

    return yield* Effect.fail(
      new UnsupportedTypeError({
        cause: null,
        message: `Unsupported type for value provided in script result: ${typeof value}`,
      }),
    );
  });

const idColumn = (type?: PgType<unknown>) => {
  const idType =
    type?.getPostgresType() || "BIGINT GENERATED ALWAYS AS IDENTITY";
  return `id ${idType} PRIMARY KEY`;
};

export class ConvertDataToSQLDDLError extends Data.TaggedError(
  "ConvertDataToSQLDDLError",
)<{
  cause: unknown;
  message: string;
}> {}

// TODO support multiple casings? (camelCase, snake_case)
const convertDataToSQLDDL = (
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
            onTrue: () => Effect.succeed(idColumn()),
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
          return idColumn(value);
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

      const ddl = yield* convertDataToSQLDDL(module, result);

      yield* sql`CREATE TABLE IF NOT EXISTS "${sql.unsafe(module.name)}" (
        ${sql.unsafe(ddl)}
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

export class DatabaseGetError extends Data.TaggedError("DatabaseGetError")<{
  cause: unknown;
  message: string;
}> {}

export const dbSelect = (module: TypefusionModuleDefault) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    return yield* sql`SELECT * FROM "${sql.unsafe(module.name)}"`.pipe(
      Effect.mapError(
        (error) =>
          new DatabaseGetError({
            cause: error,
            message: `Error fetching data from ${module.name}`,
          }),
      ),
    );
  });
