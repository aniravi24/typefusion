import { SqlClient } from "@effect/sql";
import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Layer, Redacted } from "effect";
import postgres from "postgres";

import { DatabaseHelper } from "../common/service.js";
import {
  pgColumnDDL,
  pgCreateTableIfNotExists,
  pgDropTableIfExists,
  pgInsertIntoTable,
  pgSelectAllFromTable,
} from "./helpers.js";
import { postgresIdColumn, valueToPostgresType } from "./types.js";

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
const PgLive = PgClient.layerConfig({
  onnotice: Config.succeed(() => {}),
  types: {
    bigint: Config.succeed(postgres.BigInt),
  },
  url: PgDatabaseConfig,
});

/**
 * @internal
 */
export class PgService extends Effect.Service<PgService>()("@typefusion/pg", {
  dependencies: [PgLive],
  effect: SqlClient.SqlClient,
}) {}

/**
 * @internal
 */
export const PgDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  columnDDL: pgColumnDDL,
  createTableIfNotExists: pgCreateTableIfNotExists,
  dropTableIfExists: pgDropTableIfExists,
  idColumn: postgresIdColumn,
  insertIntoTable: pgInsertIntoTable,
  selectAllFromTable: pgSelectAllFromTable,
  valueToDbType: valueToPostgresType,
});

/**
 * @internal
 */
export class PgDatabaseHelperService extends Effect.Service<PgDatabaseHelperService>()(
  "@typefusion/pg/databasehelper",
  {
    dependencies: [PgDatabaseHelperLive],
    effect: Effect.gen(function* () {
      return yield* DatabaseHelper;
    }),
  },
) {}
/**
 * @internal
 */
export const PgFinalLive = Layer.mergeAll(
  PgService.Default,
  PgDatabaseHelperService.Default,
);
