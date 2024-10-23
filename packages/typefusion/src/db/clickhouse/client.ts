import { ClickhouseClient } from "@effect/sql-clickhouse";
import { Config, Effect, Layer } from "effect";
import { DatabaseHelper } from "../common/service.js";
import {
  chDropTableIfExists,
  chCreateTableIfNotExists,
  chInsertIntoTable,
  chSelectAllFromTable,
  chColumnDDL,
} from "./helpers.js";
import { valueToClickhouseType, clickhouseIdColumn } from "./types.js";

/**
 * @internal
 */
export const ClickhouseDatabaseConfig = Config.all({
  databaseUrl: Config.orElse(Config.string("CLICKHOUSE_DATABASE_URL"), () =>
    Config.map(
      Config.all({
        CLICKHOUSE_HOST: Config.string("CLICKHOUSE_HOST"),
        CLICKHOUSE_PORT: Config.integer("CLICKHOUSE_PORT"),
      }),
      ({ CLICKHOUSE_HOST, CLICKHOUSE_PORT }) =>
        `http://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}/`,
    ),
  ),
  username: Config.string("CLICKHOUSE_USER").pipe(
    Config.orElse(() => Config.succeed(undefined)),
  ),
  password: Config.string("CLICKHOUSE_PASSWORD").pipe(
    Config.orElse(() => Config.succeed(undefined)),
  ),
  database: Config.string("CLICKHOUSE_DATABASE").pipe(
    Config.orElse(() => Config.succeed(undefined)),
  ),
});

/**
 * @internal
 */
const ClickhouseLive = ClickhouseClient.layer({
  url: Config.map(ClickhouseDatabaseConfig, (c) => c.databaseUrl),
  username: Config.map(ClickhouseDatabaseConfig, (c) => c.username),
  password: Config.map(ClickhouseDatabaseConfig, (c) => c.password),
  database: Config.map(ClickhouseDatabaseConfig, (c) => c.database),
  clickhouse_settings: {
    allow_experimental_json_type: Config.succeed(true),
  },
});

/**
 * @internal
 */
export class ClickhouseService extends Effect.Service<ClickhouseService>()(
  "@typefusion/clickhouse",
  {
    effect: ClickhouseClient.ClickhouseClient,
    dependencies: [ClickhouseLive],
  },
) {}

/**
 * @internal
 */
export const ClickhouseDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  valueToDbType: valueToClickhouseType,
  idColumn: clickhouseIdColumn,
  dropTableIfExists: chDropTableIfExists,
  createTableIfNotExists: chCreateTableIfNotExists,
  insertIntoTable: chInsertIntoTable,
  selectAllFromTable: chSelectAllFromTable,
  columnDDL: chColumnDDL,
});

/**
 * @internal
 */
export class ClickhouseDatabaseHelperService extends Effect.Service<ClickhouseDatabaseHelperService>()(
  "@typefusion/clickhouse/databasehelper",
  {
    effect: DatabaseHelper,
    dependencies: [ClickhouseDatabaseHelperLive],
  },
) {}

/**
 * @internal
 */
export const ClickhouseFinalLive = Layer.mergeAll(
  ClickhouseService.Default,
  ClickhouseDatabaseHelperService.Default,
);
