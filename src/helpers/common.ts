import {RunService} from "@rbxts/services";
import {t} from "@rbxts/t";
export interface HelperAttributes {
  Debug: boolean;
}

/**
 * JSON value
 *
 * From: https://github.com/microsoft/TypeScript/issues/1897
 */
export type JSONValue =
  | string
  | number
  | boolean
  | undefined
  | JSONValue[]
  | {[key: string]: JSONValue};

/**
 * JSON object
 *
 * From: https://github.com/microsoft/TypeScript/issues/1897
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON array
 *
 * From: https://github.com/microsoft/TypeScript/issues/1897
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * Extract tuple from LuaTuple if possible
 *
 * From: Roblox-TS Discord
 */
export type ExtractIfLuaTuple<T> = T extends LuaTuple<infer A> ? A : T;

/*
 * Check if not undefined
 */
export const isSet = <T>(x: T | undefined): x is T => x !== undefined;

/**
 * Check if undefined
 */
export const isNil = <T>(x: T | undefined): x is undefined => x === undefined;

/**
 * PCall return type
 */
export type PCallReturnType<T> = LuaTuple<[false, string] | [true, T]>;

/**
 * OpCall return type
 */
export type OpCallReturnType<T> = {success: false; error: string} | {success: true; value: T};

/**
 * Map object to checks type
 *
 * From: Osyris on Discord
 */
export type MapObjectToChecks<T> = {[K in keyof T]: t.check<T[K]>};

/**
 * Map array to checks type
 *
 * From: Osyris on Discord
 */
export type MapArrayToChecks<T> = Array<unknown> & {[K in keyof T]: t.check<T[K]>};

/**
 * Set to true when running inside studio
 */
export const isStudio = RunService.IsStudio();

/**
 * Debounce specified function
 *
 * ```typescript
 * button.Touched.Connect(debounce(5, () => {
 *   print("Button pressed");
 * }));
 * ```
 */
export const debounce = <T extends unknown[]>(
  seconds: number,
  debounceFunc: (...args: [...T]) => void
) => {
  let running = false;
  return (...args: [...T]): void => {
    if (!running) {
      running = true;
      debounceFunc(...args);
      wait(seconds);
      running = false;
    }
  };
};

/**
 * Promisify specified function returning pcall result
 */
export const promisifyP =
  <A extends unknown[], R>(func: (...args: [...A]) => PCallReturnType<R>) =>
  (...args: [...A]): Promise<R> =>
    new Promise((resolve, reject) => {
      const [success, value] = func(...args);
      if (success) {
        resolve(value as R);
      } else {
        reject(value);
      }
    });

/**
 * Promisify specified function returning opcall result
 */
export const promisifyOp =
  <A extends unknown[], R>(func: (...args: [...A]) => OpCallReturnType<R>) =>
  (...args: [...A]): Promise<R> =>
    new Promise((resolve, reject) => {
      const result = func(...args);
      if (result.success) {
        resolve(result.value);
      } else {
        reject(result.error);
      }
    });

/**
 * Fast spawn
 *
 * From: Flamework
 */
export function fastSpawn(spawnFunc: () => unknown) {
  const bindable = new Instance("BindableEvent");
  bindable.Event.Connect(spawnFunc);
  bindable.Fire();
  bindable.Destroy();
}

/**
 * Monitor specified module for hot reloading
 *
 * From: RobloxTS Discord
 */
export function hotReload(Module: ModuleScript): void {
  (Module as ModuleScript & ChangedSignal).Changed.Connect(() => {
    return require(Module.Clone());
  });
  require(Module);
}
