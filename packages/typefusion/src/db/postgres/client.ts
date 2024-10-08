import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer, Redacted } from "effect";
import postgres from "postgres";
import { SqlClient } from "@effect/sql";
import { DatabaseHelper } from "../common/service.js";
import {
  pgDropTableIfExists,
  pgCreateTableIfNotExists,
  pgInsertIntoTable,
  pgSelectAllFromTable,
  pgColumnDDL,
} from "./helpers.js";
import { valueToPostgresType, postgresIdColumn } from "./types.js";

/**
 * @internal
 */
export const PgDatabaseConfig = Config.orElse(
  Config.redacted("PG_DATABASE_URL"),
  () =>
    Config.map(
      Config.all({
        PG_DATABASE: Config.string("PG_DATABASE"),
        PG_HOST: Config.string("PG_HOST"),
        PG_PASSWORD: Config.string("PG_PASSWORD"),
        PG_PORT: Config.integer("PG_PORT"),
        PG_USER: Config.string("PG_USER"),
      }),
      ({ PG_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DATABASE }) =>
        Redacted.make(
          `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}?ssl=true`,
        ),
    ),
);

/**
 * @internal
 */
const PgLive = PgClient.layer({
  url: PgDatabaseConfig,
  types: Config.succeed({
    bigint: postgres.BigInt,
  }),
  onnotice: Config.succeed(() => {}),
});

/**
 * @internal
 */
export class PgService extends Effect.Service<PgService>()("@typefusion/pg", {
  effect: SqlClient.SqlClient,
  dependencies: [PgLive],
}) {}

/**
 * @internal
 */
export const PgDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  valueToDbType: valueToPostgresType,
  idColumn: postgresIdColumn,
  dropTableIfExists: pgDropTableIfExists,
  createTableIfNotExists: pgCreateTableIfNotExists,
  insertIntoTable: pgInsertIntoTable,
  selectAllFromTable: pgSelectAllFromTable,
  columnDDL: pgColumnDDL,
});

/**
 * @internal
 */
export class PgDatabaseHelperService extends Effect.Service<PgDatabaseHelperService>()(
  "@typefusion/pg/databasehelper",
  {
    effect: DatabaseHelper,
    dependencies: [PgDatabaseHelperLive],
  },
) {}

/**
 * @internal
 */
export const PgFinalLive = Layer.mergeAll(
  PgService.Default,
  PgDatabaseHelperService.Default,
);
