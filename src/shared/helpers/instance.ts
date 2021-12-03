/**
 * Find node using provided function returning true/false
 *
 * ```typescript
 * const isOccupied = findNode(
 *   vehicle,
 *   (x: Instance): x is Seat | VehicleSeat =>
 *     (x.IsA("Seat") || x.IsA("VehicleSeat")) && x.Occupant !== undefined
 * );
 * ```
 */
export function findNode<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): I | undefined {
  for (const subnode of <I[]>node.GetDescendants()) {
    if (testFunc(subnode)) {
      return subnode;
    }
  }
}

/**
 * Find child node using provided function returning true/false
 *
 * ```typescript
 * const isOccupied = findChildNode(
 *   vehicle,
 *   (x: Instance): x is Seat | VehicleSeat =>
 *     (x.IsA("Seat") || x.IsA("VehicleSeat")) && x.Occupant !== undefined
 * );
 * ```
 */
export function findChildNode<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): I | undefined {
  for (const subnode of <I[]>node.GetChildren()) {
    if (testFunc(subnode)) {
      return subnode;
    }
  }
}

// Find ancestor node using provided function returning true/false
export function findAncestorNode<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): I | undefined {
  let parentNode: Instance | undefined = node.Parent;
  while (parentNode) {
    if (testFunc(parentNode)) {
      return parentNode;
    }
    parentNode = parentNode.Parent;
  }
}

/**
 * Find nodes using provided function returning true/false
 *
 * ```typescript
 * // Anchor all parts
 * for (const x of findNodes(trainSection, (x): x is BasePart => x.IsA("BasePart"))) {
 *   x.Anchored = true;
 * }
 * ```
 *
 * ```typescript
 * // Weld all body parts to base
 * for (const x of findNodes(trainBody, (x): x is BasePart => x.IsA("BasePart"))) {
 *   weldParts(x, trainBase);
 * }
 * ```
 */
export function* findNodes<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): Generator<I> {
  for (const subnode of <I[]>node.GetDescendants()) {
    if (testFunc(subnode)) {
      yield subnode;
    }
  }
}

/**
 * Find child nodes using provided function returning true/false
 *
 * ```typescript
 * // Anchor all parts
 * for (const x of findChildNodes(trainSection, (x): x is BasePart => x.IsA("BasePart"))) {
 *   x.Anchored = true;
 * }
 * ```
 *
 * ```typescript
 * // Weld all body parts to base
 * for (const x of findChildNodes(trainBody, (x): x is BasePart => x.IsA("BasePart"))) {
 *   weldParts(x, trainBase);
 * }
 * ```
 */
export function* findChildNodes<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): Generator<I> {
  for (const subnode of <I[]>node.GetChildren()) {
    if (testFunc(subnode)) {
      yield subnode;
    }
  }
}

/**
 * Find nodes including in connected assemblies using provided function returning true/false
 *
 * ```typescript
 * // Anchor all parts, including connected assemblies
 * for (const x of findConnectedNodes(
 *  train, (x): x is Model => x.IsA("Model") && hasTag(x, "TrainSection")
 * )) {
 *   print(`Found train section ${x.Name}`);
 * }
 * ```
 */
export function* findConnectedNodes<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I
): Generator<I> {
  const touchedCache: Map<Instance, boolean> = new Map();
  yield* findConnectedNodesInternal(node, testFunc, touchedCache);
  touchedCache.clear();
}
function* findConnectedNodesInternal<I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I,
  touchedCache: Map<Instance, boolean>
): Generator<I> {
  if (touchedCache.get(node)) return;
  for (const subnode of <I[]>node.GetDescendants()) {
    if (touchedCache.get(subnode)) continue;
    touchedCache.set(node, true);
    if (subnode.IsA("BasePart")) {
      for (const joint of subnode.GetJoints()) {
        if (joint.IsA("Constraint")) {
          const part0 = joint.Attachment0?.Parent;
          const part1 = joint.Attachment1?.Parent;
          if (part0) {
            yield* findConnectedNodesInternal(part0, testFunc, touchedCache);
          }
          if (part1) {
            yield* findConnectedNodesInternal(part1, testFunc, touchedCache);
          }
        } else {
          if (joint.Part0) {
            yield* findConnectedNodesInternal(joint.Part0, testFunc, touchedCache);
          }
          if (joint.Part1) {
            yield* findConnectedNodesInternal(joint.Part1, testFunc, touchedCache);
          }
        }
      }
    }
    if (testFunc(subnode)) {
      yield subnode;
    }
  }
}

/**
 * Find nodes using test function then reduce using reduce function
 */
export function reduceNodes<T, I extends Instance>(
  node: Instance,
  testFunc: (instance: Instance) => instance is I,
  reduceFunc: (result: T, node: I) => T,
  initialResult: T
) {
  let result = initialResult;
  for (const subnode of findNodes<I>(node, testFunc)) {
    result = reduceFunc(result, subnode);
  }
  return result;
}
