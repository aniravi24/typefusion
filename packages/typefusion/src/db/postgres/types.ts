import { Effect } from "effect";
import { DbType, Nullable } from "../common/types.js";
import { UnsupportedJSTypeDbConversionError } from "../common/service.js";

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
  text: () => new PgType<Nullable<string>>("text"),
  integer: () => new PgType<Nullable<number>>("integer"),
  boolean: () => new PgType<Nullable<boolean>>("boolean"),
  date: () => new PgType<Nullable<Date>>("date"),
  dateTime: () => new PgType<Nullable<Date>>("timestamp"),
  bigint: () => new PgType<Nullable<bigint>>("bigint"),
  smallint: () => new PgType<Nullable<number>>("smallint"),
  real: () => new PgType<Nullable<number>>("real"),
  doublePrecision: () => new PgType<Nullable<number>>("double precision"),
  smallserial: () => new PgType<Nullable<number>>("smallserial"),
  serial: () => new PgType<Nullable<number>>("serial"),
  bigserial: () => new PgType<Nullable<bigint>>("bigserial"),
  numeric: () => new PgType<Nullable<number>>("numeric"),
  decimal: () => new PgType<Nullable<number>>("decimal"),
  money: () => new PgType<Nullable<number>>("money"),
  char: (n: number) => new PgType<Nullable<string>>(`char(${n})`),
  varchar: (n: number) => new PgType<Nullable<string>>(`varchar(${n})`),
  time: () => new PgType<Nullable<string>>("time"),
  interval: () => new PgType<Nullable<string>>("interval"),
  point: () => new PgType<Nullable<string>>("point"),
  line: () => new PgType<Nullable<string>>("line"),
  lseg: () => new PgType<Nullable<string>>("lseg"),
  box: () => new PgType<Nullable<string>>("box"),
  polygon: () => new PgType<Nullable<string>>("polygon"),
  circle: () => new PgType<Nullable<string>>("circle"),
  inet: () => new PgType<Nullable<string>>("inet"),
  cidr: () => new PgType<Nullable<string>>("cidr"),
  macaddr: () => new PgType<Nullable<string>>("macaddr"),
  tsvector: () => new PgType<Nullable<string>>("tsvector"),
  tsquery: () => new PgType<Nullable<string>>("tsquery"),
  uuid: () => new PgType<Nullable<string>>("uuid"),
  json: () => new PgType<Nullable<object>>("json"),
  jsonb: () => new PgType<Nullable<object>>("jsonb"),
  xml: () => new PgType<Nullable<string>>("xml"),
  bytea: () => new PgType<Nullable<Uint8Array>>("bytea"),
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
