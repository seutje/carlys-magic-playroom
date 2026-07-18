import type { AudioClipPlayer } from "./audioCoordinator";

export function createHtmlAudioPlayer<Cue extends string>(
  resolveUrl: (cue: Cue, format: "ogg" | "mp3") => string,
): AudioClipPlayer<Cue> {
  let current: HTMLAudioElement | undefined;
  let settleCurrent: (() => void) | undefined;
  const probe = document.createElement("audio");
  const format = probe.canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";

  return {
    play(cue, volume) {
      return new Promise<void>((resolve) => {
        const audio = new Audio(resolveUrl(cue, format));
        current = audio;
        audio.preload = "auto";
        audio.volume = volume;
        const settle = () => {
          if (current === audio) current = undefined;
          if (settleCurrent === settle) settleCurrent = undefined;
          audio.removeEventListener("ended", settle);
          audio.removeEventListener("error", settle);
          resolve();
        };
        settleCurrent = settle;
        audio.addEventListener("ended", settle, { once: true });
        audio.addEventListener("error", settle, { once: true });
        void audio.play().catch(settle);
      });
    },
    stop() {
      current?.pause();
      current = undefined;
      settleCurrent?.();
      settleCurrent = undefined;
    },
  };
}
