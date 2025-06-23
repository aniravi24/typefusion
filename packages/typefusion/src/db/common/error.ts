import { Data } from "effect";

export class UnsupportedJSTypeDbConversionError extends Data.TaggedError(
  "UnsupportedJSTypeDbConversionError",
)<{
  cause: unknown;
  message: string;
}> {}
