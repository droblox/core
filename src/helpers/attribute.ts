import Object from "@rbxts/object-utils";
import {Workspace} from "@rbxts/services";
import {t} from "@rbxts/t";

import {CleanupFuncType} from "./clean";
import {HelperAttributes, isSet, isStudio, MapObjectToChecks} from "./common";

/**
 * Check if instance attribute exists
 *
 * ```typescript
 * interface SpawnVehicleAttributes {
 *   VehicleName: string;
 * }
 * const hasSpawnVehicleAttribute = hasAttribute<SpawnVehicleAttributes>(model);
 * if (hasSpawnVehicleAttribute("VehicleName", t.string)) {
 *   // Model has "VehicleName" tag
 * }
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function hasAttribute<T>(instance: Instance): hasTypedAttribute<T> {
  return <K extends keyof T & string>(key: K, check?: t.check<T[K]>) => {
    const value = instance.GetAttribute(key);
    if (check) {
      return check(value) ? true : false;
    } else {
      return isSet(value) ? true : false;
    }
  };
}
export type hasTypedAttribute<T> = <K extends keyof T & string>(
  key: K,
  check?: t.check<T[K]>
) => boolean;

/**
 * Get instance attribute
 *
 * ```typescript
 * interface TrainAttributes {
 *   TrainDebug: boolean;
 * }
 * const getTrainAttribute = getAttribute<TrainAttributes>(train);
 * const trainDebug = getTrainAttribute("TrainDebug", false, t.boolean);
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function getAttribute<T>(instance: Instance): getTypedAttributeType<T> {
  return (<K extends keyof T & string>(key: K, fallback?: T[K], check?: t.check<T[K]>) => {
    const value = instance.GetAttribute(key) as T[K];
    if (check) {
      return check(value) ? value : fallback;
    } else {
      return isSet(value) ? value : fallback;
    }
  }) as getTypedAttributeType<T>;
}
export type getTypedAttributeType<T> = {
  <K extends keyof T & string>(key: K): T[K] | undefined;
  <K extends keyof T & string>(key: K, fallback?: T[K]): T[K];
  <K extends keyof T & string>(key: K, check?: t.check<T[K]>): T[K] | undefined;
  <K extends keyof T & string>(key: K, fallback?: T[K], check?: t.check<T[K]>): T[K];
};

/**
 * Set instance attribute
 *
 * ```typescript
 * interface PlayerAttributes {
 *   PlayerName: string;
 * }
 * const setPlayerAttribute = setAttribute<PlayerAttributes>(player);
 * setPlayerAttribute("PlayerName", result.value.name);
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function setAttribute<T>(instance: Instance): setTypedAttributeType<T> {
  return <K extends keyof T & string>(key: K, value: T[K]) => {
    return instance.SetAttribute(key, value);
  };
}
export type setTypedAttributeType<T> = <K extends keyof T & string>(key: K, value: T[K]) => void;

/**
 * Get attribute changed signal
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function getAttributeChangedSignal<T>(
  instance: Instance
): getTypedAttributeChangedSignalType<T> {
  return <K extends keyof T & string>(key: K) => {
    return instance.GetAttributeChangedSignal(key);
  };
}
export type getTypedAttributeChangedSignalType<T> = <K extends keyof T & string>(
  key: K
) => RBXScriptSignal<Callback>;

/**
 * On attribute changed signal, call change callback function with optional check
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onAttributeChange<T>(instance: Instance): onTypedAttributeChangeType<T> {
  return <K extends keyof T & string>(
    key: K,
    changeFunc: (value: T[K]) => void,
    check?: t.check<T[K]>
  ) => {
    if (isDebug) print("ATTRIBUTE", key, "ONCHANGE INIT");
    const connection = instance.GetAttributeChangedSignal(key).Connect(() => {
      if (isDebug) print("ATTRIBUTE", key, "CHANGED");
      const value = instance.GetAttribute(key) as T[K];
      if (check) {
        if (check(value)) changeFunc(value);
      } else {
        if (isSet(value)) changeFunc(value);
      }
    });
    return () => {
      if (isDebug) print("ATTRIBUTE", key, "ONCHANGE DEINIT");
      if (connection) {
        connection.Disconnect();
      }
    };
  };
}
export type onTypedAttributeChangeType<T> = <K extends keyof T & string>(
  key: K,
  changeFunc: (value: T[K]) => void,
  check?: t.check<T[K]>
) => CleanupFuncType;

/**
 * Call change callback initially, then on attribute changed signal, call change callback function with optional check
 */
export function onAttributeChangeInit<T>(instance: Instance): onTypedAttributeChangeType<T> {
  const onTypedAttributeChange = onAttributeChange<T>(instance);
  return <K extends keyof T & string>(
    key: K,
    changeFunc: (value: T[K]) => void,
    check?: t.check<T[K]>
  ) => {
    if (isDebug) print("ATTRIBUTE", key, "CHANGED");
    const value = instance.GetAttribute(key) as T[K];
    if (check) {
      if (check(value)) changeFunc(value);
    } else {
      if (isSet(value)) changeFunc(value);
    }
    return onTypedAttributeChange(key, changeFunc, check);
  };
}

/**
 * On attribute changed signal, call change callback function with optional check if test function returns true
 *
 * [[onAttributeChange]]
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onAttributeChangeIf<T>(instance: Instance): onTypedAttributeChangeIfType<T> {
  const onTypedAttributeChange = onAttributeChange<T>(instance);
  return <K extends keyof T & string, I extends Instance>(
    key: K,
    testFunc: (instance: Instance, value: T[K]) => instance is I,
    changeFunc: (instance: I, value: T[K]) => void,
    check?: t.check<T[K]>
  ) => {
    return onTypedAttributeChange<K>(
      key,
      (value: T[K]) => {
        if (testFunc(instance, value)) {
          changeFunc(instance, value);
        }
      },
      check
    );
  };
}
export type onTypedAttributeChangeIfType<T> = <K extends keyof T & string, I extends Instance>(
  key: K,
  testFunc: (instance: Instance, value: T[K]) => instance is I,
  changeFunc: (instance: I, value: T[K]) => void,
  check?: t.check<T[K]>
) => CleanupFuncType;

/*
 * Get attributes
 */
export function getAttributes<T>(instance: Instance): onTypedGetAttributesType<T> {
  return <K extends keyof T & string>(
    attributes: K[],
    defaults?: T,
    checks?: MapObjectToChecks<T>
  ) => {
    const result: Partial<T> = {};
    for (const key of attributes) {
      const value = instance.GetAttribute(key) as T[K];
      if (isSet(checks)) {
        const check = checks[key];
        if (check) {
          if (check(value)) {
            result[key] = value;
          } else {
            if (isSet(defaults)) {
              result[key] = defaults[key];
            }
          }
        } else {
          if (isSet(value)) {
            result[key] = value;
          } else {
            if (isSet(defaults)) {
              result[key] = defaults[key];
            }
          }
        }
      } else {
        if (isSet(value)) {
          result[key] = value;
        } else {
          if (isSet(defaults)) {
            result[key] = defaults[key];
          }
        }
      }
    }
    return result;
  };
}
export type onTypedGetAttributesType<T> = <K extends keyof T & string>(
  attributes: K[],
  defaults?: T,
  checks?: MapObjectToChecks<T>
) => Partial<T>;

/*
 * Set attributes
 */
export function setAttributes<T>(instance: Instance): onTypedSetAttributesType<T> {
  return (attributes: Partial<T>) => {
    for (const [key, value] of Object.entries(attributes)) {
      instance.SetAttribute(key as string, value);
    }
  };
}
export type onTypedSetAttributesType<T> = (attributes: Partial<T>) => void;

/*
 * Set to true when Workspace has Debug attribute set to true
 */
export const isDebug = getAttribute<HelperAttributes>(Workspace)("Debug", isStudio, t.boolean);
