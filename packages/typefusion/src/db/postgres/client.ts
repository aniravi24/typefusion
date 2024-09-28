import { PgClient } from "@effect/sql-pg";
import { Config, Effect, Redacted } from "effect";
import postgres from "postgres";

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
export const PgLive = PgClient.layer({
  url: PgDatabaseConfig,
  types: Config.succeed({
    bigint: postgres.BigInt,
  }),
  onnotice: Config.succeed(() => {}),
});

/**
 * @internal
 */
export const PgLiveEffect = Effect.provide(PgLive);
