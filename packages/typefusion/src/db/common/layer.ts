import { Effect } from "effect";
import { DatabaseHelper } from "./service.js";
import { valueToMySqlType, mySqlIdColumn } from "../mysql/types.js";
import { postgresIdColumn, valueToPostgresType } from "../postgres/types.js";

export const MySqlDatabaseHelperService = Effect.provideService(
  DatabaseHelper,
  {
    valueToDbType: valueToMySqlType,
    idColumn: mySqlIdColumn,
  },
);

export const PgDatabaseHelperService = Effect.provideService(DatabaseHelper, {
  valueToDbType: valueToPostgresType,
  idColumn: postgresIdColumn,
});
