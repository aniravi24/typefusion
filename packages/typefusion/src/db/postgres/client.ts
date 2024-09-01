import { PgClient } from "@effect/sql-pg";
import { Config, Redacted } from "effect";
import postgres from "postgres";

export const DatabaseConfig = Config.orElse(
  Config.redacted("DATABASE_URL"),
  () =>
    Config.map(
      Config.all({
        PGDATABASE: Config.string("PGDATABASE"),
        PGHOST: Config.string("PGHOST"),
        PGPASSWORD: Config.string("PGPASSWORD"),
        PGPORT: Config.integer("PGPORT"),
        PGUSER: Config.string("PGUSER"),
      }),
      ({ PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE }) =>
        Redacted.make(
          `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?ssl=true`,
        ),
    ),
);

export const SqlLive = PgClient.layer({
  url: DatabaseConfig,
  types: Config.succeed({
    bigint: postgres.BigInt,
  }),
});
