import { Effect } from "effect";
import { typefusion, TypefusionConfig } from "./typefusion.js";

export {
  DependencyGraphGenerationError,
  TypefusionConfig,
} from "./typefusion.js";

export { typefusionRef, typefusionRefTableName } from "./lib.js";

export {
  TypefusionPgResult,
  TypefusionResult,
  TypefusionResultDataOnly,
  TypefusionResultUnknown,
  ConvertDataToSQLDDLError,
  DatabaseGetError,
  DatabaseInsertError,
  UnsupportedTypeError,
} from "./store.js";

export { ModuleExecutionError, ModuleImportError } from "./helpers.js";

export * from "./db/postgres/types.js";

export default (config: TypefusionConfig) =>
  typefusion(config).pipe(Effect.runPromise);
