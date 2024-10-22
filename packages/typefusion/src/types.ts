import { Effect } from "effect";
import { MySqlType } from "./db/mysql/types.js";
import { PgType } from "./db/postgres/types.js";
import { PgDatabaseHelperService, PgService } from "./db/postgres/client.js";
import { MySQLDatabaseHelperService, MySQLService } from "./db/mysql/client.js";
import { ClickhouseType } from "./db/clickhouse/types.js";

export type TypefusionSupportedDatabases =
  | "postgresql"
  | "mysql"
  | "clickhouse";

export interface TypefusionScriptResult<T> {
  data: T[];
}

export type TypefusionContextEffect =
  | PgService
  | MySQLService
  | PgDatabaseHelperService
  | MySQLDatabaseHelperService;

/**
 * This is a partial type for the 'default' export of an ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptExport {
  name: string;
  schema?:
    | Record<string, PgType<unknown>>
    | Record<string, MySqlType<unknown>>
    | Record<string, ClickhouseType<unknown>>;
  resultDatabase: TypefusionSupportedDatabases;
  run?: () => PromiseLike<TypefusionScriptResult<unknown>>;
  runEffect?: <R extends TypefusionContextEffect>() => Effect.Effect<
    TypefusionScriptResult<unknown>,
    any,
    R
  >;
}

/**
 * This is a partial type for the ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptModule {
  name: string;
  default: TypefusionScriptExport;
}
