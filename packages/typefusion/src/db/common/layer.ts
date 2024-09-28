import { Context } from "effect";
import { DatabaseHelper } from "./service.js";
import { valueToMySqlType, mySqlIdColumn } from "../mysql/types.js";
import { postgresIdColumn, valueToPostgresType } from "../postgres/types.js";
import {
  mySqlDropTableIfExists,
  mySqlCreateTableIfNotExists,
  mySqlInsertIntoTable,
  mySqlSelectAllFromTable,
  mySqlColumnDDL,
} from "../mysql/helpers.js";
import {
  pgDropTableIfExists,
  pgCreateTableIfNotExists,
  pgInsertIntoTable,
  pgSelectAllFromTable,
  pgColumnDDL,
} from "../postgres/helpers.js";

/**
 * @internal
 */
export const MySqlDatabaseHelperContext = Context.make(DatabaseHelper, {
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
export const PgDatabaseHelperContext = Context.make(DatabaseHelper, {
  valueToDbType: valueToPostgresType,
  idColumn: postgresIdColumn,
  dropTableIfExists: pgDropTableIfExists,
  createTableIfNotExists: pgCreateTableIfNotExists,
  insertIntoTable: pgInsertIntoTable,
  selectAllFromTable: pgSelectAllFromTable,
  columnDDL: pgColumnDDL,
});
