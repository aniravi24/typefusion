import { Data } from "effect";

/**
 * @internal
 */
export type Nullable<T> = T | null;

/**
 * This is a simple wrapper class to represent a DB type that will be used to define a table.
 * It also provides a fluent API to set properties of the column (e.g. nullability).
 * You can easily create your own custom types by instantiating this class.
 *
 * @example
 * ```ts
 * const myCustomType = new PgType<Nullable<string>>("myCustomType");
 * ```
 */
export class DbType<Type> extends Data.Class<{
  dbType: string;
}> {
  public _tag = "DbType";
  public _nullable: boolean;
  constructor(dbType: string) {
    super({ dbType });
    this._nullable = true;
  }

  notNull(): DbType<Exclude<Type, null>> {
    this._nullable = false;
    return this as DbType<Exclude<Type, null>>;
  }

  nullable(): DbType<Nullable<Type>> {
    this._nullable = true;
    return this as DbType<Nullable<Type>>;
  }

  getNullable(): boolean {
    return this._nullable;
  }

  getDbType(): string {
    return this.dbType;
  }

  // This is a bit of a hack to get the type of the underlying type
  getType(): Type {
    return undefined as Type;
  }

  override toString(): string {
    return `${this.dbType}${this._nullable ? " " : " NOT NULL"}`;
  }
}
