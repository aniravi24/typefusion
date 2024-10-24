import { Effect } from "effect";
import { DbType, Nullable } from "../common/types.js";
import { UnsupportedJSTypeDbConversionError } from "../common/service.js";

/**
 * This is a simple wrapper class to represent a MySQL type that will be used to define a table.
 * It also provides a fluent API to set properties of the column (e.g. nullability).
 * You can easily create your own custom types by instantiating this class.
 *
 * @example
 * ```ts
 * const myCustomType = new MySqlType<Nullable<string>>("myCustomType");
 * ```
 */
export class MySqlType<Type> extends DbType<Type> {
  public override _tag = "MySqlType";
  constructor(dbType: string) {
    super(dbType);
    this._nullable = true;
  }

  override notNull(): MySqlType<Exclude<Type, null>> {
    this._nullable = false;
    return this as MySqlType<Exclude<Type, null>>;
  }

  override nullable(): MySqlType<Nullable<Type>> {
    this._nullable = true;
    return this as MySqlType<Nullable<Type>>;
  }
}

export const mySqlType = {
  text: () => new MySqlType<Nullable<string>>("TEXT"),
  int: () => new MySqlType<Nullable<number>>("INT"),
  boolean: () => new MySqlType<Nullable<boolean>>("BOOLEAN"),
  date: () => new MySqlType<Nullable<Date>>("DATE"),
  dateTime: () => new MySqlType<Nullable<Date>>("DATETIME"),
  bigint: () => new MySqlType<Nullable<bigint>>("BIGINT"),
  smallint: () => new MySqlType<Nullable<number>>("SMALLINT"),
  float: () => new MySqlType<Nullable<number>>("FLOAT"),
  double: () => new MySqlType<Nullable<number>>("DOUBLE"),
  decimal: () => new MySqlType<Nullable<number>>("DECIMAL"),
  char: (n: number) => new MySqlType<Nullable<string>>(`CHAR(${n})`),
  varchar: (n: number) => new MySqlType<Nullable<string>>(`VARCHAR(${n})`),
  time: () => new MySqlType<Nullable<string>>("TIME"),
  json: () => new MySqlType<Nullable<object>>("JSON"),
  binary: () => new MySqlType<Nullable<Uint8Array>>("BINARY"),
};

/**
 * @internal
 * @param value Any input
 * @returns A string representing the closest DB type to that value.
 */
export const valueToMySqlType = (
  value: unknown,
): Effect.Effect<string, UnsupportedJSTypeDbConversionError, never> =>
  Effect.gen(function* () {
    if (value === null || value === undefined) {
      return "TEXT";
    }
    if (value instanceof Date) {
      return "DATETIME";
    }
    switch (typeof value) {
      case "object":
        return "JSON";
      case "string":
        return "TEXT";
      case "bigint":
        return "BIGINT";
      case "number":
        if (Number.isInteger(value)) {
          // MySQL INT range: -2,147,483,648 to 2,147,483,647
          const MIN_INTEGER = -2147483648;
          const MAX_INTEGER = 2147483647;
          if (value >= MIN_INTEGER && value <= MAX_INTEGER) {
            return "INT";
          }
          return "BIGINT";
        }
        return "DOUBLE";
      case "boolean":
        return "BOOLEAN";
      default:
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: `Unsupported JS type in mysql for provided value: ${typeof value}`,
        });
    }
  });

/**
 * @internal
 * @param type a {@link MySqlType}
 * @returns a string representing the id column DDL
 */
export const mySqlIdColumn = (type?: MySqlType<unknown>) => {
  const idType = type?.getDbType() || "BIGINT AUTO_INCREMENT";
  return `id ${idType} PRIMARY KEY`;
};
