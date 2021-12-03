/**
 * Add weld parts utility function to module
 */
export function weldParts(partA: BasePart, partB: BasePart): ManualWeld {
  const weld = new Instance("ManualWeld");

  weld.Part0 = partA;
  weld.Part1 = partB;

  const offset = new CFrame(partB.Position);

  weld.C0 = partA.CFrame.Inverse().mul(offset);
  weld.C1 = partB.CFrame.Inverse().mul(offset);

  weld.Parent = partB;

  return weld;
}

/**
 * Add combine parts utility function to module
 */
export function combineParts(part: BasePart, parts: BasePart[]): UnionOperation | undefined {
  return part.UnionAsync(parts);
}

/**
 * Add cut part utility function to module
 */
export function cutParts(part: BasePart, parts: BasePart[]): UnionOperation | undefined {
  const newpart = part.SubtractAsync(parts);
  if (newpart) {
    part?.Destroy();
    return newpart;
  }
}
