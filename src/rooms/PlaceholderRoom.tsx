import { useEffect } from "react";

import { diagnostics } from "../engine/diagnostics/diagnostics";
import type { RoomComponentProps } from "./roomModule";

interface PlaceholderRoomProps extends RoomComponentProps {
  readonly title: string;
  readonly symbol: string;
  readonly color: string;
  readonly instruction: string;
}

export function PlaceholderRoom({ title, symbol, color, instruction }: PlaceholderRoomProps) {
  useEffect(() => {
    diagnostics.record({ category: "activity", code: `room-mounted:${title}` });
    return () => {
      diagnostics.record({ category: "activity", code: `room-disposed:${title}` });
    };
  }, [title]);

  return (
    <section className="placeholder-room" style={{ "--room-color": color } as React.CSSProperties}>
      <div className="room-symbol" aria-hidden="true">
        {symbol}
      </div>
      <p className="eyebrow">Something wonderful is coming</p>
      <h1>{title}</h1>
      <p className="room-instruction" role="status">
        {instruction}
      </p>
    </section>
  );
}
