import { ClickhouseClient } from "@effect/sql-clickhouse";
import { Config, Effect, Layer } from "effect";

import { DatabaseHelper } from "../common/service.js";
import {
  chColumnDDL,
  chCreateTableIfNotExists,
  chDropTableIfExists,
  chInsertIntoTable,
  chSelectAllFromTable,
} from "./helpers.js";
import { clickhouseIdColumn, valueToClickhouseType } from "./types.js";

/**
 * @internal
 */
export const ClickhouseDatabaseConfig = Config.all({
  database: Config.string("CLICKHOUSE_DATABASE").pipe(
    Config.orElse(() => Config.succeed(undefined)),
  ),
  password: Config.string("CLICKHOUSE_PASSWORD").pipe(
    Config.orElse(() => Config.succeed(undefined)),
  ),
  url: Config.orElse(Config.string("CLICKHOUSE_DATABASE_URL"), () =>
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
});

/**
 * @internal
 */
const ClickhouseLive = ClickhouseClient.layerConfig({
  clickhouse_settings: {
    allow_experimental_json_type: Config.succeed(true),
  },
  database: Config.map(ClickhouseDatabaseConfig, (c) => c.database),
  password: Config.map(ClickhouseDatabaseConfig, (c) => c.password),
  url: Config.map(ClickhouseDatabaseConfig, (c) => c.url),
  username: Config.map(ClickhouseDatabaseConfig, (c) => c.username),
});

/**
 * @internal
 */
export class ClickhouseService extends Effect.Service<ClickhouseService>()(
  "@typefusion/clickhouse",
  {
    dependencies: [ClickhouseLive],
    effect: ClickhouseClient.ClickhouseClient,
  },
) {}

/**
 * @internal
 */
export const ClickhouseDatabaseHelperLive = Layer.succeed(DatabaseHelper, {
  columnDDL: chColumnDDL,
  createTableIfNotExists: chCreateTableIfNotExists,
  dropTableIfExists: chDropTableIfExists,
  idColumn: clickhouseIdColumn,
  insertIntoTable: chInsertIntoTable,
  selectAllFromTable: chSelectAllFromTable,
  valueToDbType: valueToClickhouseType,
});

/**
 * @internal
 */
export class ClickhouseDatabaseHelperService extends Effect.Service<ClickhouseDatabaseHelperService>()(
  "@typefusion/clickhouse/databasehelper",
  {
    dependencies: [ClickhouseDatabaseHelperLive],
    effect: Effect.gen(function* () {
      return yield* DatabaseHelper;
    }),
  },
) {}

/**
 * @internal
 */
export const ClickhouseFinalLive = Layer.mergeAll(
  ClickhouseService.Default,
  ClickhouseDatabaseHelperService.Default,
);
