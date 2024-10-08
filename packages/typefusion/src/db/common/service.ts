import { Context, Data, Effect } from "effect";
import { PgType } from "../postgres/types.js";
import { MySqlType } from "../mysql/types.js";
import { SqlClient } from "@effect/sql/SqlClient";
import { Row } from "@effect/sql/SqlConnection";

export class UnsupportedJSTypeDbConversionError extends Data.TaggedError(
  "UnsupportedJSTypeDbConversionError",
)<{
  cause: unknown;
  message: string;
}> {}

/**
 * @internal
 */
export class DatabaseHelper extends Context.Tag("@typefusion/databasehelper")<
  DatabaseHelper,
  {
    /**
     * @internal
     * @param value Any input
     * @returns A string representing the closest DB type to that value.
     */
    readonly valueToDbType: (
      value: unknown,
    ) => Effect.Effect<string, UnsupportedJSTypeDbConversionError, never>;
    /**
     * @internal
     * @param type a {@link MySqlType} or {@link PgType}
     * @returns a string representing the id column DDL
     */
    readonly idColumn: <T extends PgType<unknown> | MySqlType<unknown>>(
      type?: T,
    ) => string;
    /**
     * @internal
     * @param columnName The name of the column
     * @param columnType The type of the column
     * @returns A string representing the column DDL
     */
    readonly columnDDL: (columnName: string, columnType: string) => string;
    /**
     * @internal
     * @param sql The SQL client
     * @param tableName The name of the table
     * @returns An effect that will drop the table if it exists
     */
    readonly dropTableIfExists: (
      sql: SqlClient,
      tableName: string,
    ) => Effect.Effect<void, unknown, never>;
    /**
     * @internal
     * @param sql The SQL client
     * @param tableName The name of the table
     * @param columnDefinitions The column definitions
     * @returns An effect that will create the table if it does not exist
     */
    readonly createTableIfNotExists: (
      sql: SqlClient,
      tableName: string,
      columnDefinitions: string,
    ) => Effect.Effect<void, unknown, never>;
    /**
     * @internal
     * @param sql The SQL client
     * @param tableName The name of the table
     * @param data The data to insert
     * @returns An effect that will insert the data into the table
     */
    readonly insertIntoTable: (
      sql: SqlClient,
      tableName: string,
      data: unknown[],
    ) => Effect.Effect<void, unknown, never>;
    /**
     * @internal
     * @param sql The SQL client
     * @param tableName The name of the table
     * @returns An effect that will select all from the table
     */
    readonly selectAllFromTable: (
      sql: SqlClient,
      tableName: string,
    ) => Effect.Effect<readonly Row[], unknown, never>;
  }
>() {}
