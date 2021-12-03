import {isDebug} from "./attribute";

/**
 * On property change, call change callback function
 *
 * ```typescript
 * // On server
 * onPropertyChange(pilotSeat)("Occupant", (humanoid) => {
 *   if (humanoid) {
 *     const player = Players.GetPlayerFromCharacter(humanoid.Parent);
 *     if (player) {
 *       if (validPilots.has(player.Name)) {
 *         pilotSeat.SetNetworkOwner(player);
 *         print(`Valid pilot: ${player.Name}`);
 *         trainMountPilotInterfaceEvent.FireClient(player, train, pilotSeat);
 *       } else {
 *         print(`Invalid pilot: ${player.Name}`);
 *         wait();
 *         humanoid.Jump = true;
 *       }
 *     }
 *   } else {
 *     pilotSeat.SetNetworkOwnershipAuto();
 *     print("No pilot");
 *   }
 * })
 * ```
 *
 * ```typescript
 * // On client
 * onPropertyChange(seat)("Occupant", (humanoid) => {
 *   if (!humanoid) {
 *     // Player not seated anymore
 *   }
 * })
 * ```
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onPropertyChange<I extends Instance>(instance: I) {
  return <K extends InstancePropertyNames<I>>(name: K, changeFunc: (value: I[K]) => void) => {
    if (isDebug) print("PROPERTY", name, "ONCHANGE INIT");
    const connection = instance.GetPropertyChangedSignal<I>(name).Connect(() => {
      if (isDebug) print("PROPERTY", name, "CHANGED");
      const value = instance[name];
      changeFunc(value);
    });
    return () => {
      if (isDebug) print("PROPERTY", name, "ONCHANGE DEINIT");
      if (connection) {
        connection.Disconnect();
      }
    };
  };
}

/**
 * On property change, call change callback function if test function returns true
 *
 * [[onPropertyChange]]
 *
 * Uses currying as TS does not yet support partial type parameters
 */
export function onPropertyChangeIf<I extends Instance>(instance: I) {
  const onTypedPropertyChange = onPropertyChange<I>(instance);
  return <K extends InstancePropertyNames<I>>(
    name: K,
    testFunc: (instance: Instance, value: I[K]) => boolean,
    changeFunc: (instance: I, value: I[K]) => void
  ) => {
    return onTypedPropertyChange<K>(name, (value: I[K]) => {
      if (testFunc(instance, value)) {
        changeFunc(instance, value);
      }
    });
  };
}
