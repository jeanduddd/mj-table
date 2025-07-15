import * as THREE from "three";

/**
 * Convert a DOMPointReadOnlyVector3 to a more commun Vector3 structur
 * @param entry
 * @returns Vector3
 */
function DOMPointReadOnlyToVector3(entry: DOMPointReadOnly) {
    return new THREE.Vector3(entry.x, entry.y, entry.z);
}

export function isPinching(
    hand: XRHand | undefined,
    frame: XRFrame | undefined,
    referenceSpace: XRReferenceSpace | undefined,
    threshold: number = 0.015,
): boolean {
    if (!(hand && frame && frame.getJointPose && referenceSpace)) return false;

    const thumbTip = hand.get("thumb-tip");
    const indexTip = hand.get("index-finger-tip");

    if (!thumbTip || !indexTip) {
        return false;
    }

    const thumbPose = frame.getJointPose(thumbTip, referenceSpace);
    const indexPose = frame.getJointPose(indexTip, referenceSpace);

    if (!thumbPose || !indexPose) {
        return false;
    }

    const thumbPos = DOMPointReadOnlyToVector3(thumbPose.transform.position);
    const indexPos = DOMPointReadOnlyToVector3(indexPose.transform.position);

    const distance = thumbPos.distanceTo(indexPos);
    return distance < threshold;
}

export function isPinchingMiddle(
    hand: XRHand | undefined,
    frame: XRFrame | undefined,
    referenceSpace: XRReferenceSpace,
    threshold: number = 0.025
): boolean {
    if (!(hand && frame && frame.getJointPose && referenceSpace)) return false;

    const thumbTip = hand.get("thumb-tip");
    const middleTip = hand.get("middle-finger-tip");

    if (!thumbTip || !middleTip) {
        return false;
    }

    const thumbPose = frame.getJointPose(thumbTip, referenceSpace);
    const middlePose = frame.getJointPose(middleTip, referenceSpace);

    if (!thumbPose || !middlePose) {
        return false;
    }

    const thumbPos = DOMPointReadOnlyToVector3(thumbPose.transform.position);
    const middlePos = DOMPointReadOnlyToVector3(middlePose.transform.position);

    const distance = thumbPos.distanceTo(middlePos);
    return distance < threshold;
}