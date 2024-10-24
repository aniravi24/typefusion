import { Config, Option, Layer, Effect } from "effect";
import { PgDatabaseConfig, PgFinalLive } from "../postgres/client.js";
import { MySqlDatabaseConfig, MySqlFinalLive } from "../mysql/client.js";
import {
  ClickhouseDatabaseConfig,
  ClickhouseFinalLive,
} from "../clickhouse/client.js";

export const DatabaseLayer = Layer.unwrapEffect(
  Effect.map(
    Config.all({
      pg: Config.option(PgDatabaseConfig),
      mysql: Config.option(MySqlDatabaseConfig),
      clickhouse: Config.option(ClickhouseDatabaseConfig),
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
