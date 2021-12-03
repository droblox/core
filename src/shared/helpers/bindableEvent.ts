import {ReplicatedStorage, ServerStorage} from "@rbxts/services";
import {t} from "@rbxts/t";

export type EventCallback = (...args: any[]) => void;

/**
 * Get bindable event
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function getEvent<T extends {[K in keyof T]: Callback}>(
  container: Instance = ReplicatedStorage
) {
  return <K extends keyof T & string, C extends T[K]>(name: K): BindableEvent<C> => {
    return container.FindFirstChild(name) as BindableEvent<C>;
  };
}

/**
 * Create bindable event
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function createEvent<T extends {[K in keyof T]: Callback}>(
  container: Instance = ServerStorage
) {
  return <K extends keyof T & string, C extends T[K]>(name: K): BindableEvent<C> => {
    const bindableEvent = <BindableEvent<C>>new Instance("BindableEvent");
    bindableEvent.Name = name;
    bindableEvent.Parent = container;
    return bindableEvent;
  };
}

/**
 * On bindable event fire, call callback function
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onEvent<T extends {[K in keyof T]: EventCallback}>(
  container: Instance = ServerStorage
) {
  const getTypedEvent = getEvent<T>(container);
  return <K extends keyof T & string, C extends T[K], A extends Parameters<C>>(
    name: K,
    callbackFunc: C,
    checks?: {[a in keyof A]: t.check<A[a]>}
  ) => {
    const event = getTypedEvent<K, C>(name);
    return checks
      ? event.Event.Connect(((...args: unknown[]) => {
          for (let i = 0; i < (checks as unknown as Array<t.check<unknown>>).size(); i++) {
            const check = checks[i];
            if (check && !check(args[i])) {
              return;
            }
          }
          return callbackFunc(...args);
        }) as C)
      : event.Event.Connect(callbackFunc);
  };
}
