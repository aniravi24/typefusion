// TODO
import { MysqlClient } from "@effect/sql-mysql2";
import { Config, Effect, Layer, Redacted } from "effect";
import { MySqlDatabaseHelperContext } from "../common/layer.js";

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
export const MySqlLive = MysqlClient.layer({
  url: MySqlDatabaseConfig,
});

/**
 * @internal
 */
export const MySqlLiveEffect = Effect.provide(
  Layer.mergeAll(MySqlLive, Layer.succeedContext(MySqlDatabaseHelperContext)),
);
