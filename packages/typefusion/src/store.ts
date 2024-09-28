import { Schema } from "@effect/schema";
import { Effect, Data } from "effect";
import { TypefusionScriptExport } from "./types.js";
import { SqlClient } from "@effect/sql";
import { PgType } from "./db/postgres/types.js";
import { MySqlType } from "./db/mysql/types.js";
import { DbType } from "./db/common/types.js";
import { DatabaseHelper } from "./db/common/service.js";

// TODO this file needs to be generalized so we can support other databases

// For some reason when we dynamically import the PgType when executing scripts, somePgType instanceof PgType is false
const PgTypeSchema = Schema.declare(<T>(input: unknown): input is PgType<T> => {
  if (typeof input === "object" && input !== null) {
    return "_tag" in input && input["_tag"] === "PgType";
  }
  return false;
});

const MySqlTypeSchema = Schema.declare(
  <T>(input: unknown): input is MySqlType<T> => {
    if (typeof input === "object" && input !== null) {
      return "_tag" in input && input["_tag"] === "MySqlType";
    }
    return false;
  },
);

const ScriptExportSchema = Schema.Struct({
  name: Schema.String,
  resultDatabase: Schema.Union(
    Schema.Literal("postgresql"),
    Schema.Literal("mysql"),
  ),
  schema: Schema.Union(
    Schema.Record({
      key: Schema.String,
      value: PgTypeSchema,
    }),
    Schema.Record({
      key: Schema.String,
      value: MySqlTypeSchema,
    }),
  ).pipe(Schema.optional),

  run: Schema.Any,
});

/**
 * The schema for the return type of a Typefusion script.
 */
const ScriptResultSchema = Schema.Array(
  Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }),
);

/**
 * The return type of a Typefusion script ({@link TypefusionScriptExport}) when the result contains only the 'data' field.
 */
export interface TypefusionResultDataOnly<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptExport {
  schema?: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
  run: () => PromiseLike<DataElement[]>;
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptExport}) when the result contains both the 'types' and 'data' fields
 * you want to use your existing {@link PgType} or {@link MySqlType} schema.
 */
export interface TypefusionDbResult<T extends Record<string, DbType<unknown>>>
  extends TypefusionScriptExport {
  schema: T;
  run: () => PromiseLike<
    {
      [key in keyof T]: T[key] extends DbType<infer U> ? U : never;
    }[]
  >;
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptExport}) when the result contains both the 'types' and 'data' fields
 * you want to use your existing {@link PgType} or {@link MySqlType} schema.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export interface TypefusionDbResultDataUnknown<
  T extends Record<string, DbType<unknown>>,
> extends TypefusionScriptExport {
  schema: T;
  run: () => PromiseLike<Record<any, any>[]>;
}
/**
 * The return type of a Typefusion script ({@link TypefusionScriptExport}) when the result contains both the 'types' and 'data' fields.
 * This will check that your `pgType` schema matches the data you are returning, but it's more verbose than using {@link TypefusionDbResult}.
 */

export interface TypefusionResult<DataElement extends Record<string, unknown>>
  extends TypefusionScriptExport {
  schema: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
  run: () => PromiseLike<DataElement[]>;
}

/**
 * The return type of a Typefusion script ({@link TypefusionScriptExport}) when the result contains potentially only the 'data' field.
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
  module: TypefusionScriptExport,
  result: Schema.Schema.Type<typeof ScriptResultSchema>,
) =>
  Effect.gen(function* () {
    const dbHelper = yield* DatabaseHelper;
    // If no database types are provided, we will infer them from the result data
    if (!module.schema || Object.keys(module.schema).length === 0) {
      if (result.length === 0) {
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
        Object.entries(result[0]),
        ([key, value]) =>
          Effect.if(key === "id", {
            onTrue: () => Effect.succeed(dbHelper.idColumn()),
            onFalse: () =>
              Effect.map(dbHelper.valueToDbType(value), (dbType) =>
                dbHelper.columnDDL(key, dbType),
              ),
          }),
        { concurrency: "inherit" },
      ).pipe(Effect.map((col) => col.join(", ")));
    }
    // If an ID column is not explicitly provided, we will assume you don't want a primary key
    return Object.entries(module.schema)
      .map(([key, value]) => {
        if (key === "id") {
          return dbHelper.idColumn(value);
        }
        return dbHelper.columnDDL(key, value.toString());
      })
      .join(", ");
  });

export class DatabaseInsertError extends Data.TaggedError(
  "DatabaseInsertError",
)<{
  cause: unknown;
  message: string;
}> {}

export const dbInsert = (module: TypefusionScriptExport, result: unknown) =>
  Effect.gen(function* () {
    const resultIsValidSchema = Schema.is(ScriptResultSchema)(result);
    const moduleIsValidSchema = Schema.is(ScriptExportSchema)(module);

    if (resultIsValidSchema && moduleIsValidSchema) {
      const sql = yield* SqlClient.SqlClient;
      const dbHelper = yield* DatabaseHelper;

      yield* dbHelper.dropTableIfExists(sql, module.name).pipe(
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

      yield* dbHelper
        .createTableIfNotExists(sql, module.name, columnDefinitions)
        .pipe(
          Effect.mapError(
            (error) =>
              new DatabaseInsertError({
                cause: error,
                message: `Error creating table '${module.name}'`,
              }),
          ),
        );

      // Note: We cast here because we are going to avoid validating each value in the result as the proper type, we'll let the database fail if the types are incorrect
      yield* dbHelper
        .insertIntoTable(
          sql,
          module.name,
          result as Parameters<typeof sql.insert>[0][],
        )
        .pipe(
          Effect.mapError(
            (error) =>
              new DatabaseInsertError({
                cause: error,
                message: `Error inserting data into '${module.name}'`,
              }),
          ),
        );
    } else {
      if (!resultIsValidSchema) {
        yield* Effect.logError("Invalid script run result: ", result);
        yield* Effect.fail(
          new DatabaseInsertError({
            cause: null,
            message: `Module '${module.name}' does not match expected schema, make sure your run function returns an object with the following shape: ${ScriptResultSchema.toString()}`,
          }),
        );
      }
      if (!moduleIsValidSchema) {
        yield* Effect.logError(
          "Invalid module export: ",
          // We are going to assume that people at least provided a name
          (module as TypefusionScriptExport).name,
        );
        yield* Effect.fail(
          new DatabaseInsertError({
            cause: null,
            // We are going to assume that people at least provided a name
            message: `Module '${(module as TypefusionScriptExport).name}' does not match expected schema, make sure your script returns an object with the following shape: ${ScriptExportSchema.toString()}`,
          }),
        );
      }
    }
  });

export class DatabaseSelectError extends Data.TaggedError(
  "DatabaseSelectError",
)<{
  cause: unknown;
  message: string;
}> {}

export const dbSelect = (module: TypefusionScriptExport) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const dbHelper = yield* DatabaseHelper;
    return yield* dbHelper.selectAllFromTable(sql, module.name).pipe(
      Effect.mapError(
        (error) =>
          new DatabaseSelectError({
            cause: error,
            message: `Error fetching data from ${module.name}`,
          }),
      ),
    );
  });
