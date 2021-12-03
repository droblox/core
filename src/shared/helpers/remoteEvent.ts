import {ReplicatedStorage} from "@rbxts/services";

import {MapArrayToChecks} from "./common";

export type RemoteEventCallback = (...args: any[]) => void;

/**
 * Get remote event
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function getRemoteEvent<T extends {[K in keyof T]: RemoteEventCallback}>(
  container: Instance = ReplicatedStorage
) {
  return <K extends keyof T & string, C extends T[K]>(name: K): RemoteEvent<C> => {
    return container.FindFirstChild(name) as RemoteEvent<C>;
  };
}

/**
 * Create remote event
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function createRemoteEvent<T extends {[K in keyof T]: RemoteEventCallback}>(
  container: Instance = ReplicatedStorage
) {
  return <K extends keyof T & string, C extends T[K]>(name: K) => {
    const remoteEvent = <RemoteEvent<C>>new Instance("RemoteEvent");
    remoteEvent.Name = name;
    remoteEvent.Parent = container;
    return remoteEvent;
  };
}

/**
 * On client remote event, call callback function with optional checks
 *
 * ```typescript
 * export interface TrainServerToClientEvents {
 *   TrainMountPilotInterfaceEvent: (train: Instance, seat: Seat) => void;
 * }
 *
 * const onTrainRemoteEvent = onClientRemoteEvent<TrainServerToClientEvents>();
 *
 * onTrainRemoteEvent(
 *   "TrainMountPilotInterfaceEvent",
 *   (train, seat) => {
 *     const [cleanup, deferCleanup] = prepareCleanup();
 *     deferCleanup(mountGui("TrainControlUI", createScreenGui(TrainControlDialog, {train})));
 *     deferCleanup(
 *       onPropertyChange(seat)("Occupant", (humanoid) => {
 *         if (!humanoid) {
 *           cleanup();
 *         }
 *       })
 *     );
 *   },
 *   [t.Instance, t.instanceIsA("Seat")]
 * )
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onClientRemoteEvent<T extends {[K in keyof T]: RemoteEventCallback}>(
  container: Instance = ReplicatedStorage
) {
  const getTypedRemoteEvent = getRemoteEvent<T>(container);
  return <K extends keyof T & string, C extends T[K], A extends Parameters<C>>(
    name: K,
    callbackFunc: C,
    checks?: MapArrayToChecks<A>
  ) => {
    const remoteEvent = getTypedRemoteEvent<K, C>(name);
    return checks
      ? remoteEvent.OnClientEvent.Connect(((...args: unknown[]) => {
          for (let i = 0; i < checks.size(); i++) {
            const check = checks[i];
            if (check && !check(args[i])) {
              return;
            }
          }
          return callbackFunc(...args);
        }) as C)
      : remoteEvent.OnClientEvent.Connect(callbackFunc);
  };
}

/**
 * On server remote event, call callback function with optional checks
 *
 * ```typescript
 * export interface TrainClientToServerEvents {
 *   TrainSetEnginePowerEvent: (train: Instance, power: number) => void;
 * }
 *
 * const onTrainRemoteEvent = onServertRemoteEvent<TrainClientToServerEvents>();
 *
 * onTrainRemoteEvent(
 *   "TrainSetEnginePowerEvent",
 *   (train, power) => {
 *     // Set motor power of train
 *   },
 *   [t.Instance, t.number]
 * )
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onServerRemoteEvent<T extends {[K in keyof T]: RemoteEventCallback}>(
  container: Instance = ReplicatedStorage
) {
  const getTypedRemoteEvent = getRemoteEvent<T>(container);
  return <K extends keyof T & string, C extends T[K], A extends Parameters<C>>(
    name: K,
    callbackFunc: (player: Player, ...args: Parameters<C>) => void,
    checks?: MapArrayToChecks<A>
  ) => {
    const remoteEvent = getTypedRemoteEvent<K, C>(name);
    return checks
      ? remoteEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
          for (let i = 0; i < checks.size(); i++) {
            const check = checks[i];
            if (check && !check(args[i])) {
              return;
            }
          }
          return callbackFunc(player, ...(args as Parameters<C>));
        })
      : remoteEvent.OnServerEvent.Connect((player: Player, ...args: unknown[]) =>
          callbackFunc(player, ...(args as Parameters<C>))
        );
  };
}
