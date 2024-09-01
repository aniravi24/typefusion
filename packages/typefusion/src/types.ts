export interface TypefusionModule {
  name: string;
  default: Function;
}

export type TypefusionModuleDefault = (...args: any[]) => PromiseLike<unknown>;
