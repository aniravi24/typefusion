import { MySqlType } from "./db/mysql/types.js";
import { PgType } from "./db/postgres/types.js";

export type TypefusionSupportedDatabases = "postgresql" | "mysql";

export interface TypefusionScriptResult<T> {
  data: T[];
}

/**
 * This is a partial type for the 'default' export of an ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptExport {
  name: string;
  schema?: Record<string, PgType<unknown>> | Record<string, MySqlType<unknown>>;
  resultDatabase: TypefusionSupportedDatabases;
  run: () => PromiseLike<TypefusionScriptResult<unknown>>;
}

/**
 * This is a partial type for the ES Module when importing a Typefusion script.
 */
export interface TypefusionScriptModule {
  name: string;
  default: TypefusionScriptExport;
}
