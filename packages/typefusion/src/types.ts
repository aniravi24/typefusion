import { Effect } from "effect";

import { ClickhouseType } from "./db/clickhouse/types.js";
import { MySQLDatabaseHelperService, MySQLService } from "./db/mysql/client.js";
import { MySqlType } from "./db/mysql/types.js";
import { PgDatabaseHelperService, PgService } from "./db/postgres/client.js";
import { PgType } from "./db/postgres/types.js";

export type TypefusionSupportedDatabases =
  | "clickhouse"
  | "mysql"
  | "postgresql";

export interface TypefusionScriptResult<T> {
  data: T[];
}

export type TypefusionContextEffect =
  | MySQLDatabaseHelperService
  | MySQLService
  | PgDatabaseHelperService
  | PgService;

/**
 * This is a partial type for the 'default' export of an ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptExport {
  name: string;
  resultDatabase: TypefusionSupportedDatabases;
  run?: () => PromiseLike<TypefusionScriptResult<unknown>>;
  runEffect?: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<unknown>,
    any,
    R
  >;
  schema?:
    | Record<string, ClickhouseType<unknown>>
    | Record<string, MySqlType<unknown>>
    | Record<string, PgType<unknown>>;
}

/**
 * This is a partial type for the ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptModule {
  default: TypefusionScriptExport;
  name: string;
}
