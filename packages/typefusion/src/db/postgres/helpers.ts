import { SqlClient } from "@effect/sql/SqlClient";

/**
 * @internal
 */
export const pgDropTableIfExists = (sql: SqlClient, tableName: string) =>
  sql`DROP TABLE IF EXISTS "${sql.unsafe(tableName)}"`;

/**
 * @internal
 */
export const pgCreateTableIfNotExists = (
  sql: SqlClient,
  tableName: string,
  columnDefinitions: string,
) =>
  sql`CREATE TABLE IF NOT EXISTS "${sql.unsafe(tableName)}" (${sql.unsafe(columnDefinitions)})`;

/**
 * @internal
 */
export const pgInsertIntoTable = (
  sql: SqlClient,
  tableName: string,
  data: unknown[],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
) => sql`INSERT INTO "${sql.unsafe(tableName)}" ${sql.insert(data as any)}`;

/**
 * @internal
 */
export const pgSelectAllFromTable = (sql: SqlClient, tableName: string) =>
  sql`SELECT * FROM "${sql.unsafe(tableName)}"`;

/**
 * @internal
 */
export const pgColumnDDL = (columnName: string, columnType: string) =>
  `"${columnName}" ${columnType}`;
