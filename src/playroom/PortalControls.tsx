import type { RoomId } from "../types/domain";
import { PORTALS } from "./portalDefinitions";

interface PortalControlsProps {
  readonly disabled: boolean;
  readonly onSelectRoom: (roomId: RoomId) => void;
}

export function PortalControls({ disabled, onSelectRoom }: PortalControlsProps) {
  return (
    <nav className="portal-controls" aria-label="Choose a room">
      {PORTALS.map((portal) => (
        <button
          key={portal.id}
          className={`portal-button portal-${portal.id}`}
          type="button"
          disabled={disabled}
          aria-label={portal.spokenLabel}
          onClick={() => onSelectRoom(portal.id)}
        >
          <span className="portal-symbol" aria-hidden="true">
            {portal.symbol}
          </span>
          <span className="portal-title">{portal.title}</span>
        </button>
      ))}
    </nav>
  );
}
