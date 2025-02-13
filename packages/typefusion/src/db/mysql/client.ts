import { SqlClient } from "@effect/sql";
import { MysqlClient } from "@effect/sql-mysql2";
import { Config, Effect, Layer, Redacted } from "effect";

import { DatabaseHelper } from "../common/service.js";
import {
  mySqlColumnDDL,
  mySqlCreateTableIfNotExists,
  mySqlDropTableIfExists,
  mySqlInsertIntoTable,
  mySqlSelectAllFromTable,
} from "./helpers.js";
import { mySqlIdColumn, valueToMySqlType } from "./types.js";

/**
 * @internal
 */
export const MySqlDatabaseConfig = Config.orElse(
  Config.redacted("MYSQL_DATABASE_URL"),
  () =>
    Config.map(
      Config.all({
        MYSQL_DATABASE: Config.string("MYSQL_DATABASE"),
        MYSQL_HOST: Config.string("MYSQL_HOST"),
        MYSQL_PASSWORD: Config.string("MYSQL_PASSWORD"),
        MYSQL_PORT: Config.integer("MYSQL_PORT"),
        MYSQL_USER: Config.string("MYSQL_USER"),
      }),
      ({
        MYSQL_USER,
        MYSQL_PASSWORD,
        MYSQL_HOST,
        MYSQL_PORT,
        MYSQL_DATABASE,
      }) =>
        Redacted.make(
          `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`,
        ),
    ),
);

/**
 * @internal
 */
const MySqlLive = MysqlClient.layer({
  url: Effect.runSync(MySqlDatabaseConfig),
});

/**
 * @internal
 */
export class MySQLService extends Effect.Service<MySQLService>()(
  "@typefusion/mysql",
  {
    dependencies: [MySqlLive],
    effect: SqlClient.SqlClient,
  },
) {}

/**
 * @internal
 */
export const MySqlDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  columnDDL: mySqlColumnDDL,
  createTableIfNotExists: mySqlCreateTableIfNotExists,
  dropTableIfExists: mySqlDropTableIfExists,
  idColumn: mySqlIdColumn,
  insertIntoTable: mySqlInsertIntoTable,
  selectAllFromTable: mySqlSelectAllFromTable,
  valueToDbType: valueToMySqlType,
});

/**
 * @internal
 */
export class MySQLDatabaseHelperService extends Effect.Service<MySQLDatabaseHelperService>()(
  "@typefusion/mysql/databasehelper",
  {
    dependencies: [MySqlDatabaseHelperLive],
    effect: DatabaseHelper,
  },
) {}

/**
 * @internal
 */
export const MySqlFinalLive = Layer.mergeAll(
  MySQLService.Default,
  MySQLDatabaseHelperService.Default,
);
