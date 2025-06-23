import { Effect } from "effect";

import { UnsupportedJSTypeDbConversionError } from "../common/error.js";
import { DbType, Nullable } from "../common/types.js";

/**
 * This is a simple wrapper class to represent a Postgres type that will be used to define a table.
 * It also provides a fluent API to set properties of the column (e.g. nullability).
 * You can easily create your own custom types by instantiating this class.
 *
 * @example
 * ```ts
 * const myCustomType = new PgType<Nullable<string>>("myCustomType");
 * ```
 */
export class PgType<Type> extends DbType<Type> {
  public override _tag = "PgType";
  constructor(dbType: string) {
    super(dbType);
    this._nullable = true;
  }

  override notNull(): PgType<Exclude<Type, null>> {
    this._nullable = false;
    return this as PgType<Exclude<Type, null>>;
  }

  override nullable(): PgType<Nullable<Type>> {
    this._nullable = true;
    return this as PgType<Nullable<Type>>;
  }
}

export const pgType = {
  bigint: () => new PgType<Nullable<bigint>>("bigint"),
  bigserial: () => new PgType<Nullable<bigint>>("bigserial"),
  boolean: () => new PgType<Nullable<boolean>>("boolean"),
  box: () => new PgType<Nullable<string>>("box"),
  bytea: () => new PgType<Nullable<Uint8Array>>("bytea"),
  char: (n: number) => new PgType<Nullable<string>>(`char(${n})`),
  cidr: () => new PgType<Nullable<string>>("cidr"),
  circle: () => new PgType<Nullable<string>>("circle"),
  date: () => new PgType<Nullable<Date>>("date"),
  dateTime: () => new PgType<Nullable<Date>>("timestamp"),
  decimal: () => new PgType<Nullable<number>>("decimal"),
  doublePrecision: () => new PgType<Nullable<number>>("double precision"),
  inet: () => new PgType<Nullable<string>>("inet"),
  integer: () => new PgType<Nullable<number>>("integer"),
  interval: () => new PgType<Nullable<string>>("interval"),
  json: () => new PgType<Nullable<object>>("json"),
  jsonb: () => new PgType<Nullable<object>>("jsonb"),
  line: () => new PgType<Nullable<string>>("line"),
  lseg: () => new PgType<Nullable<string>>("lseg"),
  macaddr: () => new PgType<Nullable<string>>("macaddr"),
  money: () => new PgType<Nullable<number>>("money"),
  numeric: () => new PgType<Nullable<number>>("numeric"),
  point: () => new PgType<Nullable<string>>("point"),
  polygon: () => new PgType<Nullable<string>>("polygon"),
  real: () => new PgType<Nullable<number>>("real"),
  serial: () => new PgType<Nullable<number>>("serial"),
  smallint: () => new PgType<Nullable<number>>("smallint"),
  smallserial: () => new PgType<Nullable<number>>("smallserial"),
  text: () => new PgType<Nullable<string>>("text"),
  time: () => new PgType<Nullable<string>>("time"),
  tsquery: () => new PgType<Nullable<string>>("tsquery"),
  tsvector: () => new PgType<Nullable<string>>("tsvector"),
  uuid: () => new PgType<Nullable<string>>("uuid"),
  varchar: (n: number) => new PgType<Nullable<string>>(`varchar(${n})`),
  xml: () => new PgType<Nullable<string>>("xml"),
};

/**
 * @internal
 * @param value Any input
 * @returns A string representing the closest postgres type to that value.
 */
export const valueToPostgresType = (
  value: unknown,
): Effect.Effect<string, UnsupportedJSTypeDbConversionError, never> =>
  Effect.gen(function* () {
    if (value === null || value === undefined) {
      return "TEXT";
    }
    if (value instanceof Date) {
      return "TIMESTAMP WITH TIME ZONE";
    }
    switch (typeof value) {
      case "object":
        return "JSONB";
      case "string":
        return "TEXT";
      case "bigint":
        return "BIGINT";
      case "number":
        if (Number.isInteger(value)) {
          // PostgreSQL INTEGER range: -2,147,483,648 to +2,147,483,647
          const MIN_INTEGER = -2147483648;
          const MAX_INTEGER = 2147483647;
          if (value >= MIN_INTEGER && value <= MAX_INTEGER) {
            return "INTEGER";
          }
          return "BIGINT";
        }
        return "DOUBLE PRECISION";
      case "boolean":
        return "BOOLEAN";
      case "symbol": {
        return "TEXT"; // Convert symbols to their string representation
      }
      case "undefined": {
        return "TEXT"; // Handle undefined as null-like value
      }
      case "function": {
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: "Functions cannot be stored in Postgres",
        });
      }
      default:
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: `Unsupported JS type in postgres for provided value: ${typeof value}`,
        });
    }
  });

/**
 * @internal
 * @param type a {@link PgType}
 * @returns a string representing the id column DDL
 */
export const postgresIdColumn = (type?: PgType<unknown>) => {
  const idType = type?.getDbType() || "BIGINT GENERATED ALWAYS AS IDENTITY";
  return `id ${idType} PRIMARY KEY`;
};
