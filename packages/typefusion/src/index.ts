import { Effect } from "effect";

import {
  typefusion as typefusionEffect,
  TypefusionConfig,
} from "./typefusion.js";

export * from "./db/clickhouse/types.js";
export { UnsupportedJSTypeDbConversionError } from "./db/common/error.js";
export * from "./db/mysql/types.js";
export * from "./db/postgres/types.js";
export { ModuleExecutionError, ModuleImportError } from "./helpers.js";
export { typefusionRef, typefusionRefTableName } from "./lib.js";
export {
  ConvertDataToSQLDDLError,
  DatabaseInsertError,
  DatabaseSelectError,
  TypefusionDbScript,
  TypefusionScript,
  TypefusionScriptDataOnly,
  TypefusionScriptUnknown,
} from "./store.js";
export {
  DependencyGraphGenerationError,
  TypefusionConfig,
} from "./typefusion.js";
export {
  TypefusionScriptExport,
  TypefusionSupportedDatabases,
} from "./types.js";

export const typefusion = (config: TypefusionConfig) =>
  typefusionEffect(config).pipe(Effect.runPromise);

export default typefusion;
