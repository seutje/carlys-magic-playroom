import { loadSaveData, updateSaveData } from "../../persistence/saveData";
import type { SavedCreature } from "./critter.types";
import { migrateSavedCreature, validateSavedCreature } from "./critter.validation";

export async function loadSavedCreatures(): Promise<readonly SavedCreature[]> {
  const save = await loadSaveData();
  return save.savedCreatures
    .map(migrateSavedCreature)
    .filter((creature): creature is SavedCreature => Boolean(creature));
}

export async function saveCreature(creature: SavedCreature): Promise<readonly SavedCreature[]> {
  if (!validateSavedCreature(creature)) return loadSavedCreatures();
  const save = await updateSaveData((current) => ({
    ...current,
    savedCreatures: [
      ...current.savedCreatures.filter(
        (candidate) => validateSavedCreature(candidate) && candidate.id !== creature.id,
      ),
      creature,
    ],
  }));
  return save.savedCreatures
    .map(migrateSavedCreature)
    .filter((candidate): candidate is SavedCreature => Boolean(candidate));
}
