import {PhysicsService} from "@rbxts/services";

/**
 * Create collision group
 */
export function createCollisionGroup(name: string): number | undefined {
  let result = opcall((name) => PhysicsService.GetCollisionGroupId(name), name);
  if (!result.success) {
    result = opcall((name) => PhysicsService.CreateCollisionGroup(name), name);
  }
  return result.success ? result.value : undefined;
}
