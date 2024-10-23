import { ClickhouseClient } from "@effect/sql-clickhouse/ClickhouseClient";
import { SqlClient } from "@effect/sql/SqlClient";
import { Effect } from "effect";
/**
 * @internal
 */
export const chDropTableIfExists = (
  sql: SqlClient | ClickhouseClient,
  tableName: string,
) => sql`DROP TABLE IF EXISTS ${sql.unsafe(tableName)}`;

/**
 * @internal
 */
export const chCreateTableIfNotExists = (
  sql: SqlClient | ClickhouseClient,
  tableName: string,
  columnDefinitions: string,
) => {
  const firstColumnName = columnDefinitions.split(" ")[0];
  return sql`CREATE TABLE IF NOT EXISTS ${sql.unsafe(tableName)} (${sql.unsafe(columnDefinitions)}) ORDER BY (${sql.unsafe(firstColumnName)})`;
};

/**
 * @internal
 */
export const chInsertIntoTable = (
  sql: SqlClient | ClickhouseClient,
  tableName: string,
  data: unknown[],
) =>
  (sql as ClickhouseClient)
    .insertQuery({ table: tableName, values: data })
    .pipe(Effect.asVoid);

/**
 * @internal
 */
export const chSelectAllFromTable = (
  sql: SqlClient | ClickhouseClient,
  tableName: string,
) => sql`SELECT * FROM ${sql.unsafe(tableName)}`;

/**
 * @internal
 */
export const chColumnDDL = (columnName: string, columnType: string) =>
  `${columnName} ${columnType}`;
