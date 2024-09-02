/**
 * This is a partial type for the ES Module when importing a Typefusion script.
 */
export interface TypefusionModule {
  name: string;
  default: Function;
}

/**
 * This is a partial type for the 'default' export of an ES Module when importing a Typefusion script.
 */
export type TypefusionModuleDefault = (...args: any[]) => PromiseLike<unknown>;
