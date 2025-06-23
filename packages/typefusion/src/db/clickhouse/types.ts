import { Effect } from "effect";

import { UnsupportedJSTypeDbConversionError } from "../common/error.js";
import { DbType, Nullable } from "../common/types.js";

/**
 * This is a simple wrapper class to represent a Clickhouse type that will be used to define a table.
 * It also provides a fluent API to set properties of the column (e.g. nullability).
 * You can easily create your own custom types by instantiating this class.
 *
 * @example
 * ```ts
 * const myCustomType = new ClickhouseType<Nullable<string>>("myCustomType");
 * ```
 */
export class ClickhouseType<Type> extends DbType<Type> {
  public override _tag = "ClickhouseType";
  constructor(dbType: string) {
    super(dbType);
    this._nullable = true;
  }

  override notNull(): ClickhouseType<Exclude<Type, null>> {
    this._nullable = false;
    return this as ClickhouseType<Exclude<Type, null>>;
  }

  override nullable(): ClickhouseType<Nullable<Type>> {
    this._nullable = true;
    return this as ClickhouseType<Nullable<Type>>;
  }
}

export const clickhouseType = {
  boolean: () => new ClickhouseType<Nullable<boolean>>("Bool"),
  /**
   * Needs to be a date without the time, not an ISO string
   */
  date: () => new ClickhouseType<Nullable<string>>("Date"),
  /**
   * Needs to be a date and time without the 'Z' at the end, not an ISO string
   */
  dateTime: () => new ClickhouseType<Nullable<string>>("DateTime"),
  /**
   * Needs to be a date and time without the 'Z' at the end, not an ISO string
   */
  dateTime64: (precision: number) =>
    new ClickhouseType<Nullable<string>>(`DateTime64(${precision})`),
  decimal: (precision: number, scale: number) =>
    new ClickhouseType<Nullable<number>>(`Decimal(${precision}, ${scale})`),
  enum16: (values: Record<string, number>) =>
    new ClickhouseType<Nullable<string>>(`Enum16(${JSON.stringify(values)})`),
  enum8: (values: Record<string, number>) =>
    new ClickhouseType<Nullable<string>>(`Enum8(${JSON.stringify(values)})`),
  fixedString: (n: number) =>
    new ClickhouseType<Nullable<string>>(`FixedString(${n})`),
  float32: () => new ClickhouseType<Nullable<number>>("Float32"),
  float64: () => new ClickhouseType<Nullable<number>>("Float64"),
  int16: () => new ClickhouseType<Nullable<number>>("Int16"),
  int32: () => new ClickhouseType<Nullable<number>>("Int32"),
  int64: () => new ClickhouseType<Nullable<string>>("Int64"),
  int8: () => new ClickhouseType<Nullable<number>>("Int8"),
  ipv4: () => new ClickhouseType<Nullable<string>>("IPv4"),
  ipv6: () => new ClickhouseType<Nullable<string>>("IPv6"),
  json: () => new ClickhouseType<Nullable<object>>("JSON"),
  string: () => new ClickhouseType<Nullable<string>>("String"),
  uint16: () => new ClickhouseType<Nullable<number>>("UInt16"),
  uint32: () => new ClickhouseType<Nullable<number>>("UInt32"),
  uint64: () => new ClickhouseType<Nullable<string>>("UInt64"),
  uint8: () => new ClickhouseType<Nullable<number>>("UInt8"),
  uuid: () => new ClickhouseType<Nullable<string>>("UUID"),
};

/**
 * @internal
 * @param value Any input
 * @returns A string representing the closest Clickhouse type to that value.
 */
export const valueToClickhouseType = (
  value: unknown,
): Effect.Effect<string, UnsupportedJSTypeDbConversionError, never> =>
  Effect.gen(function* () {
    if (value === null || value === undefined) {
      return "String";
    }
    if (value instanceof Date) {
      return "DateTime64(3)";
    }
    switch (typeof value) {
      case "object":
        return "JSON";
      case "string":
        return "String";
      case "number":
        if (Number.isInteger(value)) {
          if (value >= -2147483648 && value <= 2147483647) {
            return "Int32";
          }
          return "Int64";
        }
        return "Float64";
      case "boolean":
        return "Bool";
      case "bigint": {
        return "Int64"; // Clickhouse Int64 can store bigint values
      }
      case "symbol": {
        return "String"; // Convert symbols to their string representation
      }
      case "undefined": {
        return "String"; // Handle undefined as null-like value
      }
      case "function": {
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: "Functions cannot be stored in Clickhouse",
        });
      }
      default:
        return yield* new UnsupportedJSTypeDbConversionError({
          cause: null,
          message: `Unsupported JS type in Clickhouse for provided value: ${typeof value}`,
        });
    }
  });

/**
 * @internal
 * @param type a {@link ClickhouseType}
 * @returns a string representing the id column DDL
 */
export const clickhouseIdColumn = (type?: ClickhouseType<unknown>) => {
  const idType = type?.getDbType() || "UInt64";
  return `id ${idType}`;
};
