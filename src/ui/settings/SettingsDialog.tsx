import { useEffect, useRef } from "react";

import type { AudioSettings } from "../../engine/audio/audioService";

interface SettingsDialogProps {
  readonly settings: AudioSettings;
  readonly onMutedChange: (muted: boolean) => void;
  readonly onClose: () => void;
}

export function SettingsDialog({ settings, onMutedChange, onClose }: SettingsDialogProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={onClose}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h2 id="settings-title">Sound settings</h2>
        <label>
          <input
            type="checkbox"
            checked={!settings.muted}
            onChange={(event) => onMutedChange(!event.target.checked)}
          />
          Sound on
        </label>
        <button ref={closeButton} type="button" onClick={onClose}>
          Back to play
        </button>
      </section>
    </div>
  );
}
