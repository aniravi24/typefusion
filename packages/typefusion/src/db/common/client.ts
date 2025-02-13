import { Config, Effect, Layer, Option } from "effect";

import {
  ClickhouseDatabaseConfig,
  ClickhouseFinalLive,
} from "../clickhouse/client.js";
import { MySqlDatabaseConfig, MySqlFinalLive } from "../mysql/client.js";
import { PgDatabaseConfig, PgFinalLive } from "../postgres/client.js";

export const DatabaseLayer = Layer.unwrapEffect(
  Effect.map(
    Config.all({
      clickhouse: Config.option(ClickhouseDatabaseConfig),
      mysql: Config.option(MySqlDatabaseConfig),
      pg: Config.option(PgDatabaseConfig),
    }).pipe(
      Config.map(({ pg, mysql, clickhouse }) =>
        Layer.mergeAll(
          Option.match(pg, {
            onNone: () => Layer.empty as unknown as typeof PgFinalLive,
            onSome: () => PgFinalLive,
          }),
          Option.match(mysql, {
            onNone: () => Layer.empty as unknown as typeof MySqlFinalLive,
            onSome: () => MySqlFinalLive,
          }),
          Option.match(clickhouse, {
            onNone: () => Layer.empty as unknown as typeof ClickhouseFinalLive,
            onSome: () => ClickhouseFinalLive,
          }),
        ),
      ),
    ),
    (finalLayer) => finalLayer,
  ),
);
