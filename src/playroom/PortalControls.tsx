import type { RoomId } from "../types/domain";
import { PORTALS } from "./portalDefinitions";

interface PortalControlsProps {
  readonly disabled: boolean;
  readonly enabledRooms?: readonly RoomId[];
  readonly onSelectRoom: (roomId: RoomId) => void;
}

export function PortalControls({
  disabled,
  enabledRooms = PORTALS.map((portal) => portal.id),
  onSelectRoom,
}: PortalControlsProps) {
  return (
    <nav className="portal-controls" aria-label="Choose a room">
      {PORTALS.filter((portal) => enabledRooms.includes(portal.id)).map((portal) => (
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
