/**
 * Compute axis aligned bounding box region of model
 *
 * ```typescript
 * const region = computeModelAABB(modelStamp);
 * const parts = Workspace.FindPartsInRegion3(region);
 * if (parts.size() > 0) {
 *   // There are parts inside model region
 * }
 * ```
 *
 * From: https://gist.github.com/zeux/1a67e8930df782d5474276e218831e22
 */
export function computeModelAABB(model: Model) {
  const abs = math.abs;
  const inf = math.huge;

  let [minx, miny, minz] = [inf, inf, inf];
  let [maxx, maxy, maxz] = [-inf, -inf, -inf];

  for (const obj of model.GetDescendants()) {
    // model:GetDescendants has to marshal an array of instances to Lua which is pretty expensive but there's no way around it
    if (obj.IsA("BasePart")) {
      // this uses Roblox __namecall optimization - no point caching IsA, it's fast enough (although does involve LuaBridge invocation)
      const cf = obj.CFrame; // this causes a LuaBridge invocation + heap allocation to create CFrame object - expensive! - but no way around it. we need the cframe
      const size = obj.Size; // this causes a LuaBridge invocation + heap allocation to create Vector3 object - expensive! - but no way around it
      const [sx, sy, sz] = [size.X, size.Y, size.Z]; // this causes 3 Lua->C++ invocations

      const [x, y, z, R00, R01, R02, R10, R11, R12, R20, R21, R22] = cf.GetComponents(); // this causes 1 Lua->C++ invocations and gets all components of cframe in one go, with no allocations

      // https://zeuxcg.org/2010/10/17/aabb-from-obb-with-component-wise-abs/
      const wsx = 0.5 * (abs(R00) * sx + abs(R01) * sy + abs(R02) * sz); // this requires 3 Lua->C++ invocations to call abs, but no hash lookups since we cached abs value above; otherwise this is just a bunch of const ops
      const wsy = 0.5 * (abs(R10) * sx + abs(R11) * sy + abs(R12) * sz); // same
      const wsz = 0.5 * (abs(R20) * sx + abs(R21) * sy + abs(R22) * sz); // same

      // just a bunch of const ops
      if (minx > x - wsx) minx = x - wsx;
      if (miny > y - wsy) miny = y - wsy;
      if (minz > z - wsz) minz = z - wsz;

      if (maxx < x + wsx) maxx = x + wsx;
      if (maxy < y + wsy) maxy = y + wsy;
      if (maxz < z + wsz) maxz = z + wsz;
    }
  }

  return new Region3(new Vector3(minx, miny, minz), new Vector3(maxx, maxy, maxz));
}

/**
 * Compute axis aligned bounding box region of part
 *
 * ```typescript
 * const region = computePartAABB(modelStamp);
 * const parts = Workspace.FindPartsInRegion3(region);
 * if (parts.size() > 0) {
 *   // There are parts inside part region
 * }
 * ```
 *
 * From: https://devforum.roblox.com/t/part-to-region3-help/251348/4
 */
export function computePartAABB(part: BasePart) {
  const abs = math.abs;

  const cf = part.CFrame; // this causes a LuaBridge invocation + heap allocation to create CFrame object - expensive! - but no way around it. we need the cframe
  const size = part.Size; // this causes a LuaBridge invocation + heap allocation to create Vector3 object - expensive! - but no way around it
  const [sx, sy, sz] = [size.X, size.Y, size.Z]; // this causes 3 Lua->C++ invocations

  const [x, y, z, R00, R01, R02, R10, R11, R12, R20, R21, R22] = cf.GetComponents(); // this causes 1 Lua->C++ invocations and gets all components of cframe in one go, with no allocations

  // https://zeuxcg.org/2010/10/17/aabb-from-obb-with-component-wise-abs/
  const wsx = 0.5 * (abs(R00) * sx + abs(R01) * sy + abs(R02) * sz); // this requires 3 Lua->C++ invocations to call abs, but no hash lookups since we cached abs value above; otherwise this is just a bunch of const ops
  const wsy = 0.5 * (abs(R10) * sx + abs(R11) * sy + abs(R12) * sz); // same
  const wsz = 0.5 * (abs(R20) * sx + abs(R21) * sy + abs(R22) * sz); // same

  // just a bunch of const ops
  const minx = x - wsx;
  const miny = y - wsy;
  const minz = z - wsz;

  const maxx = x + wsx;
  const maxy = y + wsy;
  const maxz = z + wsz;

  return new Region3(new Vector3(minx, miny, minz), new Vector3(maxx, maxy, maxz));
}
