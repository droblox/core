import PartCacheModule from "@rbxts/partcache";
import {Workspace} from "@rbxts/services";

const debugFolder = new Instance("Folder");
debugFolder.Name = "Debug";
debugFolder.Parent = Workspace;

const cacheFolder = new Instance("Folder");
cacheFolder.Name = "Cache";
cacheFolder.Parent = debugFolder;

const templatePart = new Instance("Part");
templatePart.Anchored = true;
templatePart.CanCollide = false;
templatePart.Locked = true;
templatePart.Transparency = 0.8;
templatePart.Material = Enum.Material.Neon;
templatePart.Parent = cacheFolder;

const partCache = new PartCacheModule(templatePart, 100);

/*
 * Draw debug line with optional onion skinning
 */
export function drawDebugLine(
  v0: Vector3,
  v1: Vector3,
  color: Color3 = new Color3(1, 0, 0),
  thickness = 0.05,
  duration = 1
) {
  const part = partCache.GetPart();
  const magnitude = v0.sub(v1).Magnitude;
  part.Size = new Vector3(thickness, thickness, magnitude);
  part.CFrame = new CFrame(v0.Lerp(v1, 0.5), v1);
  part.Color = color;
  part.Transparency = 0;
  part.Parent = cacheFolder;
  wait(duration);
  partCache.ReturnPart(part);
}

/*
 * Draw debug region with optional onion skinning
 */
export function drawDebugRegion(
  v0: Vector3,
  v1: Vector3,
  color: Color3 = new Color3(1, 0, 0),
  thickness = 0.05,
  duration = 1
) {
  const parts: Part[] = [];

  const vs0 = [
    new Vector3(v0.X, v0.Y, v0.Z),
    new Vector3(v0.X, v1.Y, v0.Z),
    new Vector3(v0.X, v0.Y, v1.Z),
    new Vector3(v1.X, v0.Y, v0.Z),
    new Vector3(v0.X, v0.Y, v0.Z),
    new Vector3(v0.X, v0.Y, v1.Z),
    new Vector3(v1.X, v0.Y, v0.Z),
    new Vector3(v0.X, v1.Y, v0.Z),
    new Vector3(v0.X, v0.Y, v0.Z),
    new Vector3(v1.X, v1.Y, v0.Z),
    new Vector3(v1.X, v0.Y, v1.Z),
    new Vector3(v0.X, v1.Y, v1.Z),
  ];

  const vs1 = [
    new Vector3(v1.X, v0.Y, v0.Z),
    new Vector3(v1.X, v1.Y, v0.Z),
    new Vector3(v1.X, v0.Y, v1.Z),
    new Vector3(v1.X, v1.Y, v0.Z),
    new Vector3(v0.X, v1.Y, v0.Z),
    new Vector3(v0.X, v1.Y, v1.Z),
    new Vector3(v1.X, v0.Y, v1.Z),
    new Vector3(v0.X, v1.Y, v1.Z),
    new Vector3(v0.X, v0.Y, v1.Z),
    new Vector3(v1.X, v1.Y, v1.Z),
    new Vector3(v1.X, v1.Y, v1.Z),
    new Vector3(v1.X, v1.Y, v1.Z),
  ];

  for (let l = 0; l < vs0.size(); l++) {
    const v0 = vs0[l];
    const v1 = vs1[l];
    const part = partCache.GetPart();
    const magnitude = v0.sub(v1).Magnitude;
    part.Size = new Vector3(thickness, thickness, magnitude);
    part.CFrame = new CFrame(v0.Lerp(v1, 0.5), v1);
    part.Color = color;
    part.Transparency = 0;
    part.Parent = cacheFolder;
    parts.push(part);
  }

  wait(duration);

  for (const part of parts) {
    partCache.ReturnPart(part);
  }
}
