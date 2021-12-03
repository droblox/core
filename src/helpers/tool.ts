/**
 * Make tool part
 */
export function makeTool(part: BasePart): Tool {
  const tool = new Instance("Tool");

  tool.Archivable = true;
  tool.CanBeDropped = true;
  tool.RequiresHandle = true;

  part.Name = "Handle";
  part.Parent = tool;

  return tool;
}
