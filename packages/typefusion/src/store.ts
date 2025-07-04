import { Data, Effect, Schema } from "effect";

import {
  ClickhouseDatabaseHelperService,
  ClickhouseService,
} from "./db/clickhouse/client.js";
import { ClickhouseType } from "./db/clickhouse/types.js";
import { DbType } from "./db/common/types.js";
import { MySQLDatabaseHelperService, MySQLService } from "./db/mysql/client.js";
import { MySqlType } from "./db/mysql/types.js";
import { PgDatabaseHelperService, PgService } from "./db/postgres/client.js";
import { PgType } from "./db/postgres/types.js";
import {
  TypefusionContextEffect,
  TypefusionScriptExport,
  TypefusionScriptResult,
  TypefusionSupportedDatabases,
} from "./types.js";

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

const ClickhouseTypeSchema = Schema.declare(
  <T>(input: unknown): input is ClickhouseType<T> => {
    if (typeof input === "object" && input !== null) {
      return "_tag" in input && input["_tag"] === "ClickhouseType";
    }
    return false;
  },
);

const ScriptExportSchema = Schema.extend(
  Schema.Struct({
    name: Schema.String,
    resultDatabase: Schema.Literal("postgresql", "mysql", "clickhouse"),
    schema: Schema.Union(
      Schema.Record({
        key: Schema.String,
        value: PgTypeSchema,
      }),
      Schema.Record({
        key: Schema.String,
        value: MySqlTypeSchema,
      }),
      Schema.Record({
        key: Schema.String,
        value: ClickhouseTypeSchema,
      }),
    ).pipe(Schema.optional),
  }),
  Schema.Union(
    Schema.Struct({
      run: Schema.Any,
    }),
    Schema.Struct({
      runEffect: Schema.Any,
    }),
  ),
);

/**
 * The schema for the return type of a Typefusion script `run` function.
 */
const ScriptResultSchema = Schema.Struct({
  data: Schema.Array(
    Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
  ),
});

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `run` function contains the data without any schema.
 */
export interface TypefusionScriptDataOnly<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptExport {
  run: () => PromiseLike<TypefusionScriptResult<DataElement>>;
  schema?: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `runEffect` function contains the data without any schema.
 */
export interface TypefusionScriptDataOnlyEffect<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptExport {
  runEffect: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<DataElement>,
    any,
    R
  >;
  schema?: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `run` function contains both the 'schema' and return data
 * you want to use your existing {@link PgType} or {@link MySqlType} or {@link ClickhouseType} schema.
 */
export interface TypefusionDbScript<T extends Record<string, DbType<unknown>>>
  extends TypefusionScriptExport {
  run: () => PromiseLike<
    TypefusionScriptResult<{
      [key in keyof T]: T[key] extends DbType<infer U> ? U : never;
    }>
  >;
  schema: T;
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `runEffect` function contains both the 'schema' and return data
 * you want to use your existing {@link PgType} or {@link MySqlType} or {@link ClickhouseType} schema.
 */
export interface TypefusionDbScriptEffect<
  T extends Record<string, DbType<unknown>>,
> extends TypefusionScriptExport {
  runEffect: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<{
      [key in keyof T]: T[key] extends DbType<infer U> ? U : never;
    }>,
    any,
    R
  >;
  schema: T;
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `run` function contains both the 'schema' and return data
 * you want to use your existing {@link PgType} or {@link MySqlType} or {@link ClickhouseType} schema.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export interface TypefusionDbScriptDataUnknown<
  T extends Record<string, DbType<unknown>>,
> extends TypefusionScriptExport {
  run: () => PromiseLike<TypefusionScriptResult<Record<any, any>>>;
  schema: T;
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `runEffect` function contains both the 'schema' and return data
 * you want to use your existing {@link PgType} or {@link MySqlType} or {@link ClickhouseType} schema.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export interface TypefusionDbScriptDataUnknownEffect<
  T extends Record<string, DbType<unknown>>,
> extends TypefusionScriptExport {
  runEffect: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<Record<any, any>>,
    any,
    R
  >;
  schema: T;
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `run` function contains both the 'schema' and return data.
 * This will check that your `pgType` schema matches the data you are returning, but it's more verbose than using {@link TypefusionDbScript}.
 */

export interface TypefusionScript<DataElement extends Record<string, unknown>>
  extends TypefusionScriptExport {
  run: () => PromiseLike<TypefusionScriptResult<DataElement>>;
  schema: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `runEffect` function contains both the 'schema' and return data.
 * This will check that your `pgType` schema matches the data you are returning, but it's more verbose than using {@link TypefusionDbScript}.
 */
export interface TypefusionScriptEffect<
  DataElement extends Record<string, unknown>,
> extends TypefusionScriptExport {
  runEffect: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<DataElement>,
    any,
    R
  >;
  schema: {
    [key in keyof DataElement]: DbType<DataElement[key]>;
  };
}

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `run` function contains potentially only the return data.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export type TypefusionScriptUnknown = TypefusionScript<Record<string, unknown>>;

/**
 * The type of a Typefusion script export ({@link TypefusionScriptExport}) when the result of the `runEffect` function contains potentially only the return data.
 * However, the data is unknown, so you can pass in any data array and it will type check.
 */
export type TypefusionScriptUnknownEffect = TypefusionScriptEffect<
  Record<string, unknown>
>;

export class ConvertDataToSQLDDLError extends Data.TaggedError(
  "ConvertDataToSQLDDLError",
)<{
  cause: unknown;
  message: string;
}> {}

export class InvalidDatabaseConfigError extends Data.TaggedError(
  "InvalidDatabaseConfigError",
)<{
  cause: unknown;
  message: string;
}> {}

const dbServiceAndHelper = (module: TypefusionScriptExport) => {
  const errorText = (databaseType: TypefusionSupportedDatabases) =>
    `${databaseType} database required by typefusion script '${module.name}' but not accessible, did you set the required environment variables?`;
  switch (module.resultDatabase) {
    case "postgresql":
      return {
        helper: PgDatabaseHelperService,
        service: PgService.pipe(
          Effect.catchAllDefect(
            (error) =>
              new InvalidDatabaseConfigError({
                cause: error,
                message: errorText("postgresql"),
              }),
          ),
        ),
      };
    case "mysql":
      return {
        helper: MySQLDatabaseHelperService,
        service: MySQLService.pipe(
          Effect.catchAllDefect(
            (error) =>
              new InvalidDatabaseConfigError({
                cause: error,
                message: errorText("mysql"),
              }),
          ),
        ),
      };
    case "clickhouse":
      return {
        helper: ClickhouseDatabaseHelperService,
        service: ClickhouseService.pipe(
          Effect.catchAllDefect(
            (error) =>
              new InvalidDatabaseConfigError({
                cause: error,
                message: errorText("clickhouse"),
              }),
          ),
        ),
      };
  }
};

const convertTypefusionScriptResultToSQLDDL = (
  module: TypefusionScriptExport,
  result: Schema.Schema.Type<typeof ScriptResultSchema>,
) =>
  Effect.gen(function* () {
    const dbHelper = yield* dbServiceAndHelper(module).helper;
    // If no database types are provided, we will infer them from the result data
    if (!module.schema || Object.keys(module.schema).length === 0) {
      if (result.data.length === 0) {
        return yield* new ConvertDataToSQLDDLError({
          cause: null,
          message: `Your data for script '${module.name}' is empty, please add types for module '${module.name}'. We can't infer the database types from an empty result.`,
        });
      }
      yield* Effect.logDebug(
        `No database types provided for module '${module.name}', inferring from first item in result data.`,
      );
      // If an ID column is not explicitly provided, we will assume you don't want a primary key
      return yield* Effect.forEach(
        Object.entries(result.data[0]),
        ([key, value]) =>
          Effect.if(key === "id", {
            onFalse: () =>
              Effect.map(dbHelper.valueToDbType(value), (dbType) =>
                dbHelper.columnDDL(key, dbType),
              ),
            onTrue: () => Effect.succeed(dbHelper.idColumn()),
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
      const sql = yield* dbServiceAndHelper(module).service;
      const dbHelper = yield* dbServiceAndHelper(module).helper;

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
          result.data as Parameters<typeof sql.insert>[0][],
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
        return yield* new DatabaseInsertError({
          cause: null,
          message: `Module '${module.name}' does not match expected schema, make sure your run function returns an object with the following shape: ${ScriptResultSchema.toString()}`,
        });
      }
      if (!moduleIsValidSchema) {
        yield* Effect.logError(
          "Invalid module export: ",
          // We are going to assume that people at least provided a name
          module.name,
        );
        return yield* new DatabaseInsertError({
          cause: null,
          // We are going to assume that people at least provided a name
          message: `Module '${module.name}' does not match expected schema, make sure your script returns an object with the following shape: ${ScriptExportSchema.toString()}`,
        });
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
    const sql = yield* dbServiceAndHelper(module).service;
    const dbHelper = yield* dbServiceAndHelper(module).helper;
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
