import { Effect } from "effect";

import { UnsupportedJSTypeDbConversionError } from "../common/error.js";
import { DbType, Nullable } from "../common/types.js";

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
  bigint: () => new MySqlType<Nullable<bigint>>("BIGINT"),
  binary: () => new MySqlType<Nullable<Uint8Array>>("BINARY"),
  boolean: () => new MySqlType<Nullable<boolean>>("BOOLEAN"),
  char: (n: number) => new MySqlType<Nullable<string>>(`CHAR(${n})`),
  date: () => new MySqlType<Nullable<Date>>("DATE"),
  dateTime: () => new MySqlType<Nullable<Date>>("DATETIME"),
  decimal: () => new MySqlType<Nullable<number>>("DECIMAL"),
  double: () => new MySqlType<Nullable<number>>("DOUBLE"),
  float: () => new MySqlType<Nullable<number>>("FLOAT"),
  int: () => new MySqlType<Nullable<number>>("INT"),
  json: () => new MySqlType<Nullable<object>>("JSON"),
  smallint: () => new MySqlType<Nullable<number>>("SMALLINT"),
  text: () => new MySqlType<Nullable<string>>("TEXT"),
  time: () => new MySqlType<Nullable<string>>("TIME"),
  varchar: (n: number) => new MySqlType<Nullable<string>>(`VARCHAR(${n})`),
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
      case "symbol": {
        return "TEXT"; // Convert symbols to their string representation
      }
      case "undefined": {
        return "TEXT"; // Handle undefined as null-like value
      }
      case "function": {
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: "Functions cannot be stored in MySQL",
        });
      }
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
