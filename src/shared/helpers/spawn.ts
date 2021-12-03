/**
 * Create spawn location at position
 */
export function createSpawnLocation(position: Vector3, brickcolor: BrickColor): SpawnLocation {
  const spawnLocation = new Instance("SpawnLocation");

  spawnLocation.Locked = true;
  spawnLocation.Anchored = true;
  spawnLocation.CanCollide = false;
  spawnLocation.Transparency = 0.5;
  spawnLocation.Material = Enum.Material.Neon;
  spawnLocation.TeamColor = brickcolor;
  spawnLocation.BrickColor = brickcolor;
  spawnLocation.Position = position;
  spawnLocation.Size = new Vector3(1, 4, 4);
  spawnLocation.Shape = Enum.PartType.Cylinder;
  spawnLocation.Orientation = new Vector3(0, 0, 90);

  return spawnLocation;
}
