import {findNodes} from "./instance";

/**
 * Spawn specified model
 */
export function spawnModel(model: Model): Model {
  const modelInstance = model.Clone();
  modelInstance.MakeJoints();
  modelInstance.Parent = game.Workspace;
  return modelInstance;
}

/**
 * Create primary part for model that is its bounding box
 */
function createTempPrimaryPart(model: Model): [Model, Part] {
  const [cframe, size] = model.GetBoundingBox();
  const bbox = new Instance("Part");
  bbox.Massless = true;
  bbox.CanCollide = false;
  bbox.CastShadow = false;
  bbox.Transparency = 0.8;

  bbox.Size = size;
  bbox.CFrame = cframe;
  bbox.Parent = model;
  model.PrimaryPart = bbox;

  for (const x of findNodes(model, (x): x is BasePart => x.IsA("BasePart"))) {
    const weld = new Instance("WeldConstraint");
    weld.Part0 = bbox;
    weld.Part1 = x;
    weld.Parent = bbox;
  }

  return [model, bbox];
}

/**
 * Create model bounding box part
 */
export function createModelBoundingBoxPart(model: Model) {
  const bbox = new Instance("Part");

  bbox.Massless = true;
  bbox.Anchored = true;
  bbox.CanCollide = false;
  bbox.CastShadow = false;
  bbox.Transparency = 0.5;

  const [orientation, size] = model.GetBoundingBox();
  bbox.CFrame = orientation;
  bbox.Size = size;

  return bbox;
}

/**
 * Move model into the position and rotation of cframe
 */
export function moveModel(model: Model, cframe: CFrame) {
  if (model.PrimaryPart) {
    // Use existing primary part
    const rotation = model.GetPrimaryPartCFrame().sub(model.PrimaryPart.Position);
    model.SetPrimaryPartCFrame(cframe.mul(rotation));
  } else {
    // Create temp primary part
    const [newModel, bbox] = createTempPrimaryPart(model);
    if (model.PrimaryPart && newModel.PrimaryPart?.Position) {
      const rotation = newModel.GetPrimaryPartCFrame().sub(newModel.PrimaryPart?.Position);
      newModel.SetPrimaryPartCFrame(cframe.mul(rotation));
      bbox.Destroy();
    }
  }
}
