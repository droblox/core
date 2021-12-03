import {t} from "@rbxts/t";

import {ExtractIfLuaTuple} from "./common";

const isInstance = t.Instance;
const isScriptConnection = t.RBXScriptConnection;

const isClassWithUCDestroyMember = t.interface({
  Destroy: t.callback,
});
const isClassWithLCDestroyMember = t.interface({
  destroy: t.callback,
});

/**
 * Cleanup function type
 */
export type CleanupFuncType = () => void;

/**
 * Optional cleanup function type
 */
export type OptionalCleanupFuncType = CleanupFuncType | undefined | void;

/**
 * Defer cleanup function type
 */
export type DeferCleanupFuncType = <X>(result: X) => ExtractIfLuaTuple<X>;

/**
 * Prepare for cleanup
 *
 * ```typescript
 * // Cleanup instance
 * const [cleanup, deferCleanup] = prepareCleanup();
 * const valuesFolder = deferCleanup(new Instance("Folder"));
 * cleanup();
 * ```
 *
 * ```typescript
 * // Cleanup tag on game close
 * const [cleanup, deferCleanup] = prepareCleanup();
 * deferCleanup(
 *   onTag("Train", (vehicle) => {
 *     // Instance with "Train" tag appeared
 *   })
 * );
 * game.BindToClose(cleanup);
 * ```
 *
 * @returns A tuple, a cleanup function and a defer cleanup function
 */
export function prepareCleanup(): [CleanupFuncType, DeferCleanupFuncType] {
  const tasks: Array<CleanupFuncType> = [];
  function addTask(arg: unknown) {
    if (isInstance(arg)) {
      tasks.push(() => arg?.Destroy());
    } else if (isScriptConnection(arg)) {
      tasks.push(() => arg?.Disconnect());
    } else if (isClassWithUCDestroyMember(arg)) {
      tasks.push(() => arg?.Destroy());
    } else if (isClassWithLCDestroyMember(arg)) {
      tasks.push(() => arg?.destroy());
    } else if (typeIs(arg, "function")) {
      tasks.push(() => <CleanupFuncType>arg());
    }
  }
  return [
    () => {
      for (let i = tasks.size() - 1; i >= 0; i--) {
        const task = tasks[i];
        if (type(task) === "function") {
          task();
        }
      }
      tasks.clear();
    },
    <X>(result: X): ExtractIfLuaTuple<X> => {
      if (typeIs(result, "table")) {
        addTask((result as unknown[])[0]);
      } else {
        addTask(result as unknown);
      }
      return result as unknown as ExtractIfLuaTuple<X>;
    },
  ];
}
