const TIP = { index: 8, middle: 12, ring: 16, pinky: 20 };
const PIP = { index: 6, middle: 10, ring: 14, pinky: 18 };

export function countExtendedFingers(landmarks) {
  let count = 0;
  for (const finger of ["index", "middle", "ring", "pinky"]) {
    const tip = landmarks[TIP[finger]];
    const pip = landmarks[PIP[finger]];
    if (tip.y < pip.y) count++;
  }
  return count;
}

export function totalFingersForHand(landmarks) {
  return 1 + countExtendedFingers(landmarks);
}

export function resolveGesture(handsLandmarks) {
  if (!handsLandmarks || handsLandmarks.length < 2) return null;
  const totals = handsLandmarks.map(totalFingersForHand);
  if (totals[0] !== totals[1]) return null;
  const total = totals[0];
  if (total < 2 || total > 5) return null;
  return total;
}
