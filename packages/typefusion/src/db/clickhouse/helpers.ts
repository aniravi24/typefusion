import { SqlClient } from "@effect/sql/SqlClient";
import { ClickhouseClient } from "@effect/sql-clickhouse/ClickhouseClient";
import { Effect } from "effect";
/**
 * @internal
 */
export const chDropTableIfExists = (
  sql: ClickhouseClient | SqlClient,
  tableName: string,
) => sql`DROP TABLE IF EXISTS ${sql.unsafe(tableName)}`;

/**
 * @internal
 */
export const chCreateTableIfNotExists = (
  sql: ClickhouseClient | SqlClient,
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
  sql: ClickhouseClient | SqlClient,
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
  sql: ClickhouseClient | SqlClient,
  tableName: string,
) => sql`SELECT * FROM ${sql.unsafe(tableName)}`;

/**
 * @internal
 */
export const chColumnDDL = (columnName: string, columnType: string) =>
  `${columnName} ${columnType}`;
