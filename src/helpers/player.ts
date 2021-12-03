import {Players} from "@rbxts/services";

import {isDebug} from "./attribute";
import {CleanupFuncType} from "./clean";

/**
 * Safely get player character
 */
export function getPlayerCharacter(player: Player): Model {
  return player.Character || player.CharacterAdded.Wait()[0];
}

/**
 * Safely get player character humanoid
 */
export function getPlayerHumanoid(player: Player): Humanoid {
  return getPlayerCharacter(player).WaitForChild("Humanoid") as Humanoid;
}

/**
 * Get player character humanoid root part
 */
export function getPlayerHumanoidRootPart(player: Player): BasePart {
  const humanoid = getPlayerHumanoid(player);
  return humanoid.RootPart ?? humanoid.GetPropertyChangedSignal("RootPart").Wait()[0];
}

/**
 * On player spawn call spawn function returning despawn function
 *
 * ```typescript
 * onPlayerSpawn((player, character, rootpart) => {
 *   const [cleanup, deferCleanup] = prepareCleanup();
 *
 *   const part = deferCleanup(new Instance("Part"));
 *   addTag(part, "RouteUiPart");
 *
 *   part.Name = "UiPart";
 *   part.Size = new Vector3(5, 5, 5);
 *   if (character.PrimaryPart) {
 *     part.CFrame = character.PrimaryPart?.CFrame.mul(new CFrame(10, 0, 20));
 *   }
 *   part.Parent = Workspace;
 *
 *   return () => cleanup();
 * })
 * ```
 */
export function onPlayerSpawn(
  spawnFunc: (player: Player, character: Model, rootpart: BasePart) => CleanupFuncType
): CleanupFuncType {
  if (isDebug) print("PLAYER ONSPAWN INIT");

  const characterAdded = new Map<string, RBXScriptConnection>();
  const characterRemoving = new Map<string, RBXScriptConnection>();

  const playerAdded = Players.PlayerAdded.Connect((player: Player) => {
    characterAdded.set(
      player.Name,
      player.CharacterAdded.Connect((character) => {
        if (isDebug) print("PLAYER", player.Name, "SPAWNED");

        if (characterAdded.has(player.Name)) {
          characterAdded.get(player.Name)?.Disconnect();
          characterAdded.delete(player.Name);
        }
        const rootpart = <BasePart>character.WaitForChild("HumanoidRootPart");
        rootpart.GetPropertyChangedSignal("Position").Wait();
        const despawnFunc = spawnFunc(player, character, rootpart);

        characterRemoving.set(
          player.Name,
          player.CharacterRemoving.Connect(() => {
            if (characterRemoving.has(player.Name)) {
              characterRemoving.get(player.Name)?.Disconnect();
              characterRemoving.delete(player.Name);
            }
            if (isDebug) print("PLAYER", player.Name, "DESPAWNED");
            despawnFunc();
          })
        );
      })
    );
  });

  return () => {
    for (const [key] of pairs(characterRemoving)) {
      if (characterRemoving.has(key)) {
        characterRemoving.get(key)?.Disconnect();
        characterRemoving.delete(key);
      }
    }
    for (const [key] of pairs(characterAdded)) {
      if (characterAdded.has(key)) {
        characterAdded.get(key)?.Disconnect();
        characterAdded.delete(key);
      }
    }
    if (playerAdded) {
      playerAdded.Disconnect();
    }
    if (isDebug) print("PLAYER ONSPAWN DEINIT");
  };
}
