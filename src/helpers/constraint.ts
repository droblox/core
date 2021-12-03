import {Workspace} from "@rbxts/services";

import {findChildNodes} from "./instance";

/*
 * Auto connect constraint if test function returns true by specifying one attachment
 */
export function autoConnectConstraintIf(
  constraint: Constraint,
  originAttachment: Attachment,
  testFunc: (
    otherAttachment: Attachment,
    otherAttachmentDistance: number,
    originAttachment: Attachment
  ) => boolean,
  scanDistance = 4,
  maxParts = 20
): boolean {
  const attachmentCandidates: AttachmentCandidate[] = [];
  const regionScanDistance = new Vector3(scanDistance, scanDistance, scanDistance);
  const region = new Region3(
    originAttachment.WorldPosition.sub(regionScanDistance),
    originAttachment.WorldPosition.add(regionScanDistance)
  );
  const parts = Workspace.FindPartsInRegion3(region, originAttachment.Parent, maxParts);
  for (const part of parts) {
    for (const otherAttachment of findChildNodes(part, (x): x is Attachment =>
      x.IsA("Attachment")
    )) {
      if (originAttachment !== otherAttachment) {
        const otherAttachmentDistance = math.abs(
          originAttachment.WorldPosition.sub(otherAttachment.WorldPosition).Magnitude
        );
        attachmentCandidates.push({otherAttachment, otherAttachmentDistance});
      }
    }
  }
  attachmentCandidates.sort((a, b) => a.otherAttachmentDistance < b.otherAttachmentDistance);
  for (const {otherAttachment, otherAttachmentDistance} of attachmentCandidates) {
    if (testFunc(otherAttachment, otherAttachmentDistance, originAttachment)) {
      constraint.Attachment0 = originAttachment;
      constraint.Attachment1 = otherAttachment;
      return true;
    }
  }
  return false;
}
interface AttachmentCandidate {
  otherAttachmentDistance: number;
  otherAttachment: Attachment;
}

/*
 * Auto connect weld constraint if test function returns true by specifying one part
 */
export function autoConnectWeldConstraintIf(
  constraint: WeldConstraint,
  originPart: BasePart,
  testFunc: (otherPart: BasePart, otherPartDistance: number, originPart: BasePart) => boolean,
  scanDistance = 4,
  maxParts = 20
): boolean {
  const partCandidates: PartCandidate[] = [];
  const regionScanDistance = new Vector3(scanDistance, scanDistance, scanDistance);
  const region = new Region3(
    originPart.Position.sub(regionScanDistance),
    originPart.Position.add(regionScanDistance)
  );
  const parts = Workspace.FindPartsInRegion3(region, originPart.Parent, maxParts);
  for (const otherPart of parts) {
    const otherPartDistance = math.abs(originPart.Position.sub(otherPart.Position).Magnitude);
    partCandidates.push({otherPart, otherPartDistance});
  }
  partCandidates.sort((a, b) => a.otherPartDistance < b.otherPartDistance);
  for (const {otherPart, otherPartDistance} of partCandidates) {
    if (testFunc(otherPart, otherPartDistance, originPart)) {
      constraint.Part0 = originPart;
      constraint.Part1 = otherPart;
      return true;
    }
  }
  return false;
}
interface PartCandidate {
  otherPartDistance: number;
  otherPart: BasePart;
}

/**
 * Get weld offsets
 */
export function getWeldOffsets(partA: BasePart, partB: BasePart): [CFrame, CFrame] {
  const offset = new CFrame(partB.Position);
  return [partA.CFrame.Inverse().mul(offset), partB.CFrame.Inverse().mul(offset)];
}
