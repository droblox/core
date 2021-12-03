export enum OverQuadTreeAction {
  Stop,
  Continue,
  Finish,
}

export interface OverQuadTreeResult {
  xSize: number;
  ySize: number;
  xOffset: number;
  yOffset: number;
  xCenter: number;
  yCenter: number;
  depth: number;
}

export function* overQuadTree(
  testFunc: (
    xSize: number,
    ySize: number,
    xOffset: number,
    yOffset: number,
    depth: number
  ) => OverQuadTreeAction,
  xSize = 1000,
  ySize = 1000,
  xOffset = 0,
  yOffset = 0,
  depth = 0
): Generator<OverQuadTreeResult> {
  const size = math.max(xSize, ySize);
  const xTileSize = size / 3;
  const yTileSize = size / 3;
  for (let xTileOffset = -xTileSize; xTileOffset <= size; xTileOffset += xTileSize) {
    for (let yTileOffset = -yTileSize; yTileOffset <= size; yTileOffset += yTileSize) {
      const xCenter = xTileOffset + xTileSize / 2;
      const yCenter = yTileOffset + yTileSize / 2;
      const action = testFunc(xSize, ySize, xTileOffset, yTileOffset, depth);
      switch (action) {
        case OverQuadTreeAction.Continue:
          yield* overQuadTree(testFunc, xTileSize, yTileSize, xCenter, yCenter, depth + 1);
          break;
        case OverQuadTreeAction.Finish:
          yield {
            xSize,
            ySize,
            xOffset,
            yOffset,
            xCenter,
            yCenter,
            depth,
          };
          break;
        case OverQuadTreeAction.Stop:
          return;
      }
    }
  }
}

/*
  for (const tile of subdivideSpace(
    ({xSize, ySize, xCenter, yCenter}) => {
      const tileParts = Workspace.GetPartBoundsInBox(
        new CFrame(xCenter, 0, yCenter),
        new Vector3(xSize + xTileOverlap, 200, ySize + yTileOverlap),
        tileOverlapParams
      );
      print(tileParts.size());
      return tileParts.size() > 0 ? SubdivideSpaceAction.Done : SubdivideSpaceAction.Skip;
    },
    xSize,
    ySize
  )) {
*/

export enum SubdivideSpaceAction {
  Skip,
  Subdivide,
  Done,
}

export interface SubdivideSpaceResult {
  xSize: number;
  ySize: number;
  xOffset: number;
  yOffset: number;
  xCenter: number;
  yCenter: number;
  depth: number;
}

export function* subdivideSpace(
  testFunc: (tile: SubdivideSpaceResult) => SubdivideSpaceAction,
  xSize = 1000,
  ySize = 1000,
  xTileSize = 500,
  yTileSize = 500,
  xOffset = 0,
  yOffset = 0,
  depth = 0
): Generator<SubdivideSpaceResult> {
  const xHalfSize = xSize / 2;
  const yHalfSize = ySize / 2;
  for (
    let xTileOffset = xOffset - xHalfSize;
    xTileOffset <= xOffset + xHalfSize + 20;
    xTileOffset += xTileSize
  ) {
    for (
      let yTileOffset = yOffset - yHalfSize;
      yTileOffset <= yOffset + yHalfSize + 20;
      yTileOffset += yTileSize
    ) {
      const xTileCenter = xTileOffset + xTileSize / 2;
      const yTileCenter = yTileOffset + yTileSize / 2;
      print(xTileOffset, yTileOffset);
      const action = testFunc({
        xSize: xTileSize,
        ySize: yTileSize,
        xOffset: xTileOffset,
        yOffset: yTileOffset,
        xCenter: xTileCenter,
        yCenter: yTileCenter,
        depth,
      });
      switch (action) {
        case SubdivideSpaceAction.Subdivide:
          yield* subdivideSpace(
            testFunc,
            xTileSize,
            yTileSize,
            xTileSize / 2,
            yTileSize / 2,
            xTileCenter,
            yTileCenter,
            depth + 1
          );
          break;
        case SubdivideSpaceAction.Done:
          yield {
            xSize: xTileSize,
            ySize: yTileSize,
            xOffset: xTileOffset,
            yOffset: xTileOffset,
            xCenter: xTileCenter,
            yCenter: yTileCenter,
            depth,
          };
          break;
        case SubdivideSpaceAction.Skip:
          return;
      }
    }
  }
}
