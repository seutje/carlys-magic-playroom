import { useCallback, useEffect, useRef, useState } from "react";

import { buildMetadata } from "../../engine/diagnostics/buildMetadata";
import {
  defaultSaveData,
  loadSaveData,
  resetSaveData,
  updateSaveData,
  type LearningCategory,
  type SaveData,
} from "../../persistence/saveData";
import { migrateGardenProgress } from "../../rooms/garden/garden.persistence";
import { migrateMusicProgress } from "../../rooms/music/music.persistence";
import { migrateShapeProgress } from "../../rooms/shapes/shapes.persistence";
import { migrateTrainProgress } from "../../rooms/train/train.progress";
import type { RoomId } from "../../types/domain";
import { useSettings } from "./settingsContext";

type ResetScope = "progress" | "creatures" | "settings" | "all";

const ROOM_LABELS: Readonly<Record<RoomId, string>> = {
  train: "Tiny Delivery Train",
  critter: "Build-a-Critter Lab",
  garden: "Little Garden",
  shapes: "Magic Shape Factory",
  music: "Musical Corner",
};
const CATEGORY_LABELS: Readonly<Record<LearningCategory, string>> = {
  counting: "Counting",
  creativity: "Creative building",
  nature: "Nature and cause-and-effect",
  shapes: "Shapes, sizes, and colors",
  music: "Music, pitch, and volume",
};
const ROOM_CATEGORY: Readonly<Record<RoomId, LearningCategory>> = {
  train: "counting",
  critter: "creativity",
  garden: "nature",
  shapes: "shapes",
  music: "music",
};

export function ParentArea({ onClose }: { readonly onClose: () => void }) {
  const { settings, update, reset } = useSettings();
  const [save, setSave] = useState<SaveData>(defaultSaveData);
  const [confirming, setConfirming] = useState<ResetScope | undefined>();
  const close = useRef<HTMLButtonElement>(null);
  const refresh = useCallback(
    () =>
      loadSaveData()
        .then(setSave)
        .catch(() => setSave(defaultSaveData)),
    [],
  );

  useEffect(() => {
    close.current?.focus();
    void refresh();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose, refresh]);

  const applyReset = async (scope: ResetScope) => {
    if (scope === "progress") {
      await updateSaveData((current) => ({ ...current, roomProgress: {} }));
    } else if (scope === "creatures") {
      await updateSaveData((current) => ({ ...current, savedCreatures: [] }));
    } else if (scope === "settings") {
      await reset();
    } else {
      await resetSaveData();
      await reset();
    }
    setConfirming(undefined);
    await refresh();
  };

  const toggleRoom = (roomId: RoomId, enabled: boolean) => {
    const rooms = enabled
      ? [...new Set([...settings.enabledRooms, roomId])]
      : settings.enabledRooms.filter((candidate) => candidate !== roomId);
    if (
      rooms.length > 0 &&
      rooms.some((room) => settings.enabledLearningCategories.includes(ROOM_CATEGORY[room]))
    ) {
      void update({ enabledRooms: rooms });
    }
  };
  const toggleCategory = (category: LearningCategory, enabled: boolean) => {
    const categories = enabled
      ? [...new Set([...settings.enabledLearningCategories, category])]
      : settings.enabledLearningCategories.filter((candidate) => candidate !== category);
    if (
      categories.length > 0 &&
      settings.enabledRooms.some((room) => categories.includes(ROOM_CATEGORY[room]))
    ) {
      void update({ enabledLearningCategories: categories });
    }
  };

  const train = migrateTrainProgress(save.roomProgress.train);
  const garden = migrateGardenProgress(save.roomProgress.garden);
  const shapes = migrateShapeProgress(save.roomProgress.shapes);
  const music = migrateMusicProgress(save.roomProgress.music);
  const recentlyPlayed = (
    [
      ["train", train.completedActivities],
      ["garden", garden.completedActivities],
      ["shapes", shapes.completedActivities],
      ["music", music.completedRounds],
      ["critter", save.savedCreatures.length],
    ] as const
  ).filter(([, count]) => count > 0);

  return (
    <div className="modal-backdrop parent-modal" role="presentation">
      <section
        className="parent-area"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-title"
      >
        <header>
          <div>
            <p className="eyebrow">Local controls</p>
            <h2 id="parent-title">Grown-up area</h2>
          </div>
          <button ref={close} type="button" onClick={onClose}>
            Back to play
          </button>
        </header>
        <p className="parent-notice">
          Progress is a playful local history, not a diagnosis or formal assessment. No personal
          information is collected.
        </p>

        <fieldset>
          <legend>Sound</legend>
          <label>
            <input
              type="checkbox"
              checked={!settings.muted}
              onChange={(event) => void update({ muted: !event.target.checked })}
            />{" "}
            Sound on
          </label>
          <Range
            label="Master volume"
            value={settings.masterVolume}
            onChange={(value) => void update({ masterVolume: value })}
          />
          <Range
            label="Music volume"
            value={settings.musicVolume}
            onChange={(value) => void update({ musicVolume: value })}
          />
          <Range
            label="Speech volume"
            value={settings.speechVolume}
            onChange={(value) => void update({ speechVolume: value })}
          />
        </fieldset>

        <fieldset>
          <legend>Comfort and access</legend>
          <Check
            label="Reduce motion"
            checked={settings.reducedMotion}
            onChange={(value) => void update({ reducedMotion: value })}
          />
          <Check
            label="Reduce decorative effects"
            checked={settings.reducedEffects}
            onChange={(value) => void update({ reducedEffects: value })}
          />
          <Check
            label="High-contrast interaction outlines"
            checked={settings.highContrast}
            onChange={(value) => void update({ highContrast: value })}
          />
          <label>
            Hint timing
            <select
              value={settings.hintDelayMs}
              onChange={(event) =>
                void update({ hintDelayMs: Number(event.target.value) as 3000 | 5000 | 8000 })
              }
            >
              <option value={3000}>Sooner</option>
              <option value={5000}>Standard</option>
              <option value={8000}>More time</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Available rooms</legend>
          {(Object.keys(ROOM_LABELS) as RoomId[]).map((roomId) => (
            <Check
              key={roomId}
              label={ROOM_LABELS[roomId]}
              checked={settings.enabledRooms.includes(roomId)}
              onChange={(value) => toggleRoom(roomId, value)}
            />
          ))}
        </fieldset>
        <fieldset>
          <legend>Learning categories</legend>
          {(Object.keys(CATEGORY_LABELS) as LearningCategory[]).map((category) => (
            <Check
              key={category}
              label={CATEGORY_LABELS[category]}
              checked={settings.enabledLearningCategories.includes(category)}
              onChange={(value) => toggleCategory(category, value)}
            />
          ))}
        </fieldset>

        <section aria-labelledby="progress-summary">
          <h3 id="progress-summary">Local play summary</h3>
          {recentlyPlayed.length === 0 ? (
            <p>No activities recorded yet. The playroom is ready whenever you are.</p>
          ) : (
            <p>Recently played: {recentlyPlayed.map(([room]) => ROOM_LABELS[room]).join(", ")}.</p>
          )}
          <ul>
            <li>Train trips: {train.completedActivities}</li>
            <li>Garden games: {garden.completedActivities}</li>
            <li>Shapes made: {shapes.completedActivities}</li>
            <li>Songs matched: {music.completedRounds}</li>
            <li>Saved creatures: {save.savedCreatures.length}</li>
          </ul>
          <p>
            Encountered concepts:{" "}
            {[...new Set([...garden.concepts, ...music.concepts])].join(", ") || "None yet"}.
          </p>
        </section>

        <section className="reset-controls" aria-labelledby="reset-title">
          <h3 id="reset-title">Reset local data</h3>
          {(["progress", "creatures", "settings", "all"] as const).map((scope) =>
            confirming === scope ? (
              <div key={scope} role="alert">
                <p>Confirm {resetLabel(scope).toLowerCase()}?</p>
                <button type="button" onClick={() => void applyReset(scope)}>
                  Yes, reset
                </button>
                <button type="button" onClick={() => setConfirming(undefined)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button key={scope} type="button" onClick={() => setConfirming(scope)}>
                {resetLabel(scope)}
              </button>
            ),
          )}
        </section>
        <p className="parent-build">
          Build {buildMetadata.version} · {buildMetadata.commit}
        </p>
      </section>
    </div>
  );
}

function Range({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
function Check({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />{" "}
      {label}
    </label>
  );
}
function resetLabel(scope: ResetScope): string {
  if (scope === "progress") return "Reset learning progress";
  if (scope === "creatures") return "Delete saved creatures";
  if (scope === "settings") return "Reset settings";
  return "Reset all local data";
}
