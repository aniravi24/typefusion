import { Context, Data, Effect } from "effect";
import { PgType } from "../postgres/types.js";
import { MySqlType } from "../mysql/types.js";

export class UnsupportedJSTypeDbConversionError extends Data.TaggedError(
  "UnsupportedJSTypeDbConversionError",
)<{
  cause: unknown;
  message: string;
}> {}

export class DatabaseHelper extends Context.Tag("DatabaseHelper")<
  DatabaseHelper,
  {
    /**
     * @internal
     * @param value Any input
     * @returns A string representing the closest DB type to that value.
     */
    readonly valueToDbType: (
      value: unknown,
    ) => Effect.Effect<string, UnsupportedJSTypeDbConversionError, never>;
    /**
     * @internal
     * @param type a {@link MySqlType} or {@link PgType}
     * @returns a string representing the id column DDL
     */
    readonly idColumn: <T extends PgType<unknown> | MySqlType<unknown>>(
      type?: T,
    ) => string;
  }
>() {}
