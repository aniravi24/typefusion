import { Effect } from "effect";
import {
  typefusion as typefusionEffect,
  TypefusionConfig,
} from "./typefusion.js";

export {
  DependencyGraphGenerationError,
  TypefusionConfig,
} from "./typefusion.js";

export { typefusionRef, typefusionRefTableName } from "./lib.js";

export { UnsupportedJSTypePostgresConversionError } from "./db/postgres/types.js";

export {
  TypefusionPgResult,
  TypefusionResult,
  TypefusionResultDataOnly,
  TypefusionResultUnknown,
  ConvertDataToSQLDDLError,
  DatabaseSelectError,
  DatabaseInsertError,
} from "./store.js";

export { ModuleExecutionError, ModuleImportError } from "./helpers.js";

export * from "./db/postgres/types.js";

export const typefusion = (config: TypefusionConfig) =>
  typefusionEffect(config).pipe(Effect.runPromise);

export default typefusion;
