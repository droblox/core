import {DataStoreService} from "@rbxts/services";
import {t} from "@rbxts/t";

import {isNil, isSet, JSONObject, OpCallReturnType} from "./common";

/**
 * Datastore request options type
 */
export interface DataStoreRequestOptions {
  retryCount?: number;
  retryDelay?: number;
  waitBudgetDelay?: number;
  waitBudgetTreshold?: number;
}

/**
 * Datastore load request options type
 */
export interface DataStoreLoadOptions extends DataStoreRequestOptions {
  sessionLock?: number;
  sessionTimeout?: number;
  sessionRetryCount?: number;
  sessionRetryDelay?: number;
}

/**
 * Datastore save request options type
 */
export interface DataStoreSaveOptions extends DataStoreRequestOptions {
  sessionLock?: number;
  sessionRetryCount?: number;
  sessionRetryDelay?: number;
}

/**
 * Get datastore
 */
export function getDataStore(name: string, scope?: string): GlobalDataStore {
  return DataStoreService.GetDataStore(name, scope);
}

/**
 * Get ordered datastore
 */
export function getOrderedDataStore(name: string, scope?: string): OrderedDataStore {
  return DataStoreService.GetOrderedDataStore(name, scope);
}

const retryDataStoreRequest = <A extends unknown[], R>(
  retryCount: number,
  retryDelay: number,
  retryFunc: (...args: [...A]) => R,
  ...args: [...A]
): OpCallReturnType<R> => {
  let retryIndex = 1;
  for (;;) {
    const result = opcall(() => retryFunc(...args));
    if (result.success) {
      return {
        value: result.value,
        success: true,
      };
    }
    if (retryIndex > retryCount) {
      return {
        error: "Max request retries reached",
        success: false,
      };
    }
    wait(retryDelay * retryIndex);
    retryIndex++;
  }
};

/**
 * Get datastore value
 */
export function getDataStoreValue<T>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (key: string): OpCallReturnType<T | undefined> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(Enum.DataStoreRequestType.GetAsync) <
        waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      return dataStore.GetAsync<T>(key);
    });
  };
}

/**
 * Set datastore value
 */
export function setDataStoreValue<T>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (key: string, value?: T): OpCallReturnType<void> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(
          Enum.DataStoreRequestType.SetIncrementAsync
        ) < waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      dataStore.SetAsync(key, value);
    });
  };
}

/**
 * Update datastore value
 */
export function updateDataStoreValue<T>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (
    key: string,
    transformFunc: (oldValue: T | undefined) => T | undefined
  ): OpCallReturnType<T | undefined> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(Enum.DataStoreRequestType.UpdateAsync) <
        waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      return dataStore.UpdateAsync<T, T | undefined>(key, transformFunc);
    });
  };
}

/**
 * Increment datastore value
 */
export function incrementDataStoreValue(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (key: string, delta?: number): OpCallReturnType<number> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(
          Enum.DataStoreRequestType.SetIncrementAsync
        ) < waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      return dataStore.IncrementAsync(key, delta);
    });
  };
}

/**
 * Get sorted datastore value
 */
export function getSortedDataStoreValue(
  dataStore: OrderedDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (
    ascending: boolean,
    pagesize: number,
    minValue?: number,
    maxValue?: number
  ): OpCallReturnType<DataStorePages> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(Enum.DataStoreRequestType.GetSortedAsync) <
        waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      return dataStore.GetSortedAsync(ascending, pagesize, minValue, maxValue);
    });
  };
}

/**
 * Remove datastore value
 */
export function removeDataStoreValue<T>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
  }: DataStoreRequestOptions
) {
  return (key: string): OpCallReturnType<T | undefined> => {
    return retryDataStoreRequest(retryCount, retryDelay, () => {
      while (
        DataStoreService.GetRequestBudgetForRequestType(
          Enum.DataStoreRequestType.SetIncrementAsync
        ) < waitBudgetTreshold
      ) {
        wait(waitBudgetDelay);
      }
      return dataStore.RemoveAsync<T>(key);
    });
  };
}

/**
 * Datastore save / load object value type
 *
 * ```typescript
 * const [cleanup, deferCleanup] = prepareCleanup();
 *
 * interface PlayerProfile extends DataStoreObjectValue {
 *   name: string;
 * }
 *
 * const PlayerProfileDefault: PlayerProfile = {
 *   name: "unnamed",
 * };
 *
 * interface PlayerAttributes {
 *   PlayerName: string;
 * }
 *
 * deferCleanup(
 *   onPlayerSpawn((player) => {
 *     const [cleanup, deferCleanup] = prepareCleanup();
 *
 *     const dataStore = getDataStore("Players");
 *     const dataStoreKey = `Player_${player.UserId}`;
 *     const getPlayerAttribute = getAttribute<PlayerAttributes>(player);
 *
 *     const result = loadDataStoreValue<PlayerProfile>(dataStore, {})(
 *       dataStoreKey,
 *       PlayerProfileDefault
 *     );
 *
 *     if (result.success) {
 *       setAttribute<PlayerAttributes>(player)("PlayerName", result.value.name);
 *
 *       deferCleanup(
 *         onInterval(`Save${dataStoreKey}`, 60, () => {
 *           const name = getPlayerAttribute("PlayerName", PlayerProfileDefault.name, t.string);
 *           const savePlayer = saveDataStoreValue<PlayerProfile>(dataStore, {});
 *           savePlayer(dataStoreKey, {
 *             name,
 *           });
 *         })
 *       );
 *     }
 *
 *     return () => {
 *       cleanup();
 *       if (result.success) {
 *         const name = getPlayerAttribute("PlayerName", PlayerProfileDefault.name, t.string);
 *         const savePlayer = saveDataStoreValue<PlayerProfile>(dataStore, {
 *           waitBudgetTreshold: 0,
 *           sessionLock: 0,
 *         });
 *         savePlayer(dataStoreKey, {
 *           name,
 *         });
 *       }
 *     };
 *   })
 * );
 *
 * game.BindToClose(() => {
 *   if (RunService.IsStudio()) {
 *     wait(1);
 *   }
 * });
 *
 * game.BindToClose(cleanup);
 * ```
 *
 * From: https://devforum.roblox.com/t/datastores-beginners-to-advanced/1275421
 */
export type DataStoreObjectValue = JSONObject;

/**
 * Safely load datastore value
 *
 * [[DataStoreObjectValue]]
 *
 * From: https://devforum.roblox.com/t/datastores-beginners-to-advanced/1275421
 */
export function loadDataStoreValue<T extends DataStoreObjectValue>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
    sessionLock = os.time(),
    sessionRetryCount = 5,
    sessionRetryDelay = 10,
    sessionTimeout = 1800,
  }: DataStoreLoadOptions
) {
  return <O extends T & {sessionLock?: number}>(key: string, fallback: T): OpCallReturnType<T> => {
    let sessionRetryIndex = 1;
    for (;;) {
      const result = updateDataStoreValue<O>(dataStore, {
        retryCount,
        retryDelay,
        waitBudgetDelay,
        waitBudgetTreshold,
      })(key, (oldValue): O | undefined => {
        const value = isNil(oldValue) ? (fallback as O) : oldValue;
        if (t.number(value.sessionLock)) {
          if (sessionLock - value.sessionLock < sessionTimeout) {
            return undefined;
          } else {
            value.sessionLock = sessionLock;
            return value;
          }
        } else {
          value.sessionLock = sessionLock;
          return value;
        }
      });
      if (result.success && isSet(result.value)) {
        return {
          value: result.value,
          success: true,
        };
      }
      if (sessionRetryIndex > sessionRetryCount) {
        return {
          error: "Max session retries reached",
          success: false,
        };
      }
      wait(sessionRetryDelay * sessionRetryIndex);
      sessionRetryIndex++;
    }
  };
}

/**
 * Safely save datastore value
 *
 * [[DataStoreObjectValue]]
 *
 * From: https://devforum.roblox.com/t/datastores-beginners-to-advanced/1275421
 */
export function saveDataStoreValue<T extends DataStoreObjectValue>(
  dataStore: GlobalDataStore,
  {
    retryCount = 5,
    retryDelay = 10,
    waitBudgetDelay = 5,
    waitBudgetTreshold = 2,
    sessionLock = os.time(),
    sessionRetryCount = 5,
    sessionRetryDelay = 10,
  }: DataStoreSaveOptions
) {
  return <O extends T & {sessionLock?: number}>(key: string, value: T): OpCallReturnType<T> => {
    let sessionRetryIndex = 1;
    for (;;) {
      const result = updateDataStoreValue<O>(dataStore, {
        retryCount,
        retryDelay,
        waitBudgetDelay,
        waitBudgetTreshold,
      })(key, (): O => {
        return {
          ...value,
          sessionLock,
        } as O;
      });
      if (result.success && isSet(result.value)) {
        return {
          value: result.value,
          success: true,
        };
      }
      if (sessionRetryIndex > sessionRetryCount) {
        return {
          error: "Max session retries reached",
          success: false,
        };
      }
      wait(sessionRetryDelay * sessionRetryIndex);
      sessionRetryIndex++;
    }
  };
}
