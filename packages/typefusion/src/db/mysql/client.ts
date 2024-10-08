import { MysqlClient } from "@effect/sql-mysql2";
import { Config, Effect, Layer, Redacted } from "effect";
import { SqlClient } from "@effect/sql";
import { DatabaseHelper } from "../common/service.js";
import {
  mySqlDropTableIfExists,
  mySqlCreateTableIfNotExists,
  mySqlInsertIntoTable,
  mySqlSelectAllFromTable,
  mySqlColumnDDL,
} from "./helpers.js";
import { valueToMySqlType, mySqlIdColumn } from "./types.js";

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
  url: MySqlDatabaseConfig,
});

/**
 * @internal
 */
export class MySQLService extends Effect.Service<MySQLService>()(
  "@typefusion/mysql",
  {
    effect: SqlClient.SqlClient,
    dependencies: [MySqlLive],
  },
) {}

/**
 * @internal
 */
export const MySqlDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  valueToDbType: valueToMySqlType,
  idColumn: mySqlIdColumn,
  dropTableIfExists: mySqlDropTableIfExists,
  createTableIfNotExists: mySqlCreateTableIfNotExists,
  insertIntoTable: mySqlInsertIntoTable,
  selectAllFromTable: mySqlSelectAllFromTable,
  columnDDL: mySqlColumnDDL,
});

/**
 * @internal
 */
export class MySQLDatabaseHelperService extends Effect.Service<MySQLDatabaseHelperService>()(
  "@typefusion/mysql/databasehelper",
  {
    effect: DatabaseHelper,
    dependencies: [MySqlDatabaseHelperLive],
  },
) {}

/**
 * @internal
 */
export const MySqlFinalLive = Layer.mergeAll(
  MySQLService.Default,
  MySQLDatabaseHelperService.Default,
);
