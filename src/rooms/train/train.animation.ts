const TRAIN_DEPARTURE_SPEED = 4.5;

/** Keeps departure movement deterministic and restores the train on a restarted round. */
export function nextTrainDepartureX(
  currentX: number,
  deltaSeconds: number,
  departing: boolean,
  reducedMotion: boolean,
): number {
  if (!departing) return 0;
  return reducedMotion ? currentX : currentX + deltaSeconds * TRAIN_DEPARTURE_SPEED;
}
