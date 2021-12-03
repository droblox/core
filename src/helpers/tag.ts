import {CollectionService} from "@rbxts/services";

import {isDebug} from "./attribute";
import {CleanupFuncType, OptionalCleanupFuncType} from "./clean";

/**
 * On tag, call add callback function if tag is added
 *
 * ```typescript
 * const removeOnTag = onTag(
 *   "SomethingTag",
 *   (instance) => {
 *     // Do something with instance
 *   }
 * )
 * game.BindToClose(removeOnTag);
 * ```
 */
export function onTag(
  tag: string,
  addFunc: (instance: Instance) => OptionalCleanupFuncType
): CleanupFuncType {
  if (isDebug) print("TAG", tag, "INIT");

  const cleanupFuncs = new Map<Instance, () => void>();

  const addedSignal = CollectionService.GetInstanceAddedSignal(tag);
  const removedSignal = CollectionService.GetInstanceRemovedSignal(tag);

  for (const x of CollectionService.GetTagged(tag)) {
    if (isDebug) print("TAG", tag, "FOUND");
    const cleanupFunc = addFunc(x);
    if (cleanupFunc) {
      cleanupFuncs.set(x, cleanupFunc);
    }
  }

  const addedSignalConnection = addedSignal.Connect((x: Instance) => {
    if (isDebug) print("TAG", tag, "ADDED");
    const cleanupFunc = addFunc(x);
    if (cleanupFunc) {
      cleanupFuncs.set(x, cleanupFunc);
    }
  });

  const removedSignalConnection = removedSignal.Connect((x: Instance) => {
    if (isDebug) print("TAG", tag, "REMOVED");
    if (cleanupFuncs.has(x)) {
      cleanupFuncs.get(x)?.();
      cleanupFuncs.delete(x);
    }
  });

  return () => {
    if (isDebug) print("TAG", tag, "DEINIT");
    removedSignalConnection?.Disconnect();
    addedSignalConnection?.Disconnect();
    cleanupFuncs?.clear();
  };
}

/**
 * On tag, call add callback function if test function returns true
 *
 * ```typescript
 * const removeOnTag = onTagIf(
 *   "OnlyOnBasePart",
 *   (x): x is BasePart => x.IsA("BasePart"),
 *   (basePart) => {
 *     // Do something with base part
 *   }
 * )
 * game.BindToClose(removeOnTag);
 * ```
 */
export function onTagIf<I extends Instance>(
  tag: string,
  testFunc: (instance: Instance) => instance is I,
  addFunc: (instance: I) => OptionalCleanupFuncType
): CleanupFuncType {
  return onTag(tag, (instance) => {
    if (testFunc(instance)) {
      return addFunc(instance);
    }
  });
}

/**
 * On instance tag, call add callback function
 */
export function onInstanceTag<I extends Instance>(
  instance: I,
  tag: string,
  addFunc: (instance: I) => OptionalCleanupFuncType
): CleanupFuncType {
  return onTag(tag, (currentInstance: Instance) => {
    if (currentInstance === instance) {
      return addFunc(instance);
    }
  });
}

/**
 * On instance tag, call add callback function if test function returns true
 */
export function onInstanceTagIf<I extends Instance>(
  instance: I,
  tag: string,
  testFunc: (instance: I) => instance is I,
  addFunc: (instance: I) => OptionalCleanupFuncType
): CleanupFuncType {
  return onInstanceTag(instance, tag, (currentInstance) => {
    if (testFunc(currentInstance)) {
      return addFunc(currentInstance);
    }
  });
}

/**
 * Check if instance has tag
 */
export function hasTag(instance: Instance, tag: string): boolean {
  return CollectionService.HasTag(instance, tag);
}

/**
 * Add tag to instance
 */
export function addTag(instance: Instance, tag: string): CleanupFuncType {
  CollectionService.AddTag(instance, tag);
  return () => {
    CollectionService.RemoveTag(instance, tag);
  };
}
