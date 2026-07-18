import "fake-indexeddb/auto";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { loadSaveData, resetSaveData, updateSaveData } from "../../src/persistence/saveData";
import { ParentArea } from "../../src/ui/settings/ParentArea";
import { SettingsProvider } from "../../src/ui/settings/SettingsProvider";

describe("ParentArea", () => {
  beforeEach(() => resetSaveData());

  it("summarizes local-only progress without assessment language", async () => {
    await updateSaveData((save) => ({
      ...save,
      roomProgress: {
        train: { schemaVersion: 1, completedActivities: 2 },
        garden: { schemaVersion: 1, completedActivities: 1, concepts: ["water"] },
      },
      savedCreatures: [{ id: "creature" }],
    }));
    render(
      <SettingsProvider>
        <ParentArea onClose={() => undefined} />
      </SettingsProvider>,
    );
    expect(await screen.findByText("Train trips: 2")).toBeInTheDocument();
    expect(screen.getByText("Saved creatures: 1")).toBeInTheDocument();
    expect(screen.getByText(/not a diagnosis/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/name|email|birth/i)).not.toBeInTheDocument();
  });

  it("confirms scoped resets and preserves unrelated local data", async () => {
    const user = userEvent.setup();
    await updateSaveData((save) => ({
      ...save,
      roomProgress: { train: { schemaVersion: 1, completedActivities: 2 } },
      savedCreatures: [{ id: "creature" }],
    }));
    render(
      <SettingsProvider>
        <ParentArea onClose={() => undefined} />
      </SettingsProvider>,
    );
    await screen.findByText("Train trips: 2");
    await user.click(screen.getByRole("button", { name: "Reset learning progress" }));
    expect(screen.getByText("Confirm reset learning progress?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, reset" }));
    await waitFor(async () => expect((await loadSaveData()).roomProgress).toEqual({}));
    expect((await loadSaveData()).savedCreatures).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Delete saved creatures" }));
    await user.click(screen.getByRole("button", { name: "Yes, reset" }));
    await waitFor(async () => expect((await loadSaveData()).savedCreatures).toEqual([]));
  });

  it("resets settings separately and full local data only after confirmation", async () => {
    const user = userEvent.setup();
    await updateSaveData((save) => ({
      ...save,
      settings: { ...save.settings, muted: true, masterVolume: 0.2 },
      roomProgress: { train: { schemaVersion: 1, completedActivities: 1 } },
      savedCreatures: [{ id: "creature" }],
    }));
    render(
      <SettingsProvider>
        <ParentArea onClose={() => undefined} />
      </SettingsProvider>,
    );
    await screen.findByText("Train trips: 1");
    await user.click(screen.getByRole("button", { name: "Reset settings" }));
    await user.click(screen.getByRole("button", { name: "Yes, reset" }));
    await waitFor(async () => expect((await loadSaveData()).settings).toEqual(defaultSettings()));
    expect((await loadSaveData()).savedCreatures).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Reset all local data" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect((await loadSaveData()).savedCreatures).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Reset all local data" }));
    await user.click(screen.getByRole("button", { name: "Yes, reset" }));
    await waitFor(async () => expect((await loadSaveData()).savedCreatures).toEqual([]));
    expect((await loadSaveData()).roomProgress).toEqual({});
  });
});

function defaultSettings() {
  return {
    muted: false,
    masterVolume: 1,
    musicVolume: 0.8,
    speechVolume: 1,
    reducedMotion: false,
    reducedEffects: false,
    highContrast: false,
    hintDelayMs: 5000,
    enabledRooms: ["train", "critter", "garden", "shapes", "music"],
    enabledLearningCategories: ["counting", "creativity", "nature", "shapes", "music"],
  };
}
