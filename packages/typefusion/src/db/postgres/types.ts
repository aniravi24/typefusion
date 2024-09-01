export type Nullable<T> = T | null;

export class PgType<T> {
  public _type: T;
  private _nullable: boolean;
  private _postgresType: string;
  constructor(postgresType: string) {
    // This is really more like a phantom type, it doesn't matter what it is at runtime
    this._type = "PgType" as T;
    this._nullable = true;
    this._postgresType = postgresType;
  }

  notNull(): PgType<Exclude<T, null>> {
    this._nullable = false;
    return this as PgType<Exclude<T, null>>;
  }

  nullable(): PgType<Nullable<T>> {
    this._nullable = true;
    return this as PgType<Nullable<T>>;
  }

  getNullable(): boolean {
    return this._nullable;
  }

  getPostgresType(): string {
    return this._postgresType;
  }

  // This is a bit of a hack to get the type of the underlying type
  getType(): T {
    return this._type;
  }

  toString(): string {
    return `${this._postgresType}${this._nullable ? " " : " NOT NULL"}`;
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
