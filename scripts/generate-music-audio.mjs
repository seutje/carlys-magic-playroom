import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 48_000;
const OUTPUT_DIRECTORY = fileURLToPath(new URL("../public/audio/music/", import.meta.url));
const workDirectory = mkdtempSync(join(tmpdir(), "cmp-music-audio-"));

const cues = [
  { id: "drum-normal", samples: drum(), loudness: -18, truePeak: -3 },
  { id: "bell-normal", samples: bell(698.46), loudness: -18, truePeak: -3 },
  { id: "xylophone-normal", samples: xylophone(1_046.5), loudness: -18, truePeak: -3 },
  { id: "bell-high", samples: bell(1_046.5), loudness: -18, truePeak: -3 },
  { id: "bell-low", samples: bell(392), loudness: -18, truePeak: -3 },
  { id: "drum-loud", samples: drum(), loudness: -14, truePeak: -3 },
  { id: "drum-soft", samples: drum(), loudness: -24, truePeak: -8 },
];

try {
  for (const cue of cues) {
    const source = join(workDirectory, `${cue.id}-source.wav`);
    const normalized = join(workDirectory, `${cue.id}.wav`);
    writeFileSync(source, encodeWav(cue.samples));
    normalizeLoudness(source, normalized, cue.loudness, cue.truePeak);
    runFfmpeg([
      "-i",
      normalized,
      "-c:a",
      "libvorbis",
      "-q:a",
      "4",
      join(OUTPUT_DIRECTORY, `${cue.id}.ogg`),
    ]);
    runFfmpeg([
      "-i",
      normalized,
      "-c:a",
      "libmp3lame",
      "-q:a",
      "4",
      join(OUTPUT_DIRECTORY, `${cue.id}.mp3`),
    ]);
  }
} finally {
  rmSync(workDirectory, { recursive: true, force: true });
}

function drum() {
  const duration = 0.78;
  const random = seededNoise(0x434d5004);
  return render(duration, (time) => {
    const sweepPhase = 2 * Math.PI * (142 * time - (62 * time * time) / (2 * duration));
    const body = Math.sin(sweepPhase) * Math.exp(-time * 7.2);
    const speakerTone = Math.sin(2 * Math.PI * 196 * time) * Math.exp(-time * 15) * 0.24;
    const mallet = (random() * 2 - 1) * Math.exp(-time * 68) * 0.2;
    return attack(time, 0.004) * (body + speakerTone + mallet);
  });
}

function bell(frequency) {
  const duration = 1.32;
  const partials = [
    [1, 0.72, 2.1],
    [2.01, 0.3, 3.1],
    [2.67, 0.18, 4.2],
    [4.08, 0.09, 6.2],
  ];
  return render(duration, (time) => {
    const tone = partials.reduce(
      (sum, [ratio, amplitude, decay]) =>
        sum +
        Math.sin(2 * Math.PI * frequency * ratio * time) * amplitude * Math.exp(-time * decay),
      0,
    );
    return attack(time, 0.003) * tone;
  });
}

function xylophone(frequency) {
  const duration = 0.68;
  const random = seededNoise(0x584c4f34);
  return render(duration, (time) => {
    const bar =
      Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 9.5) +
      Math.sin(2 * Math.PI * frequency * 3.02 * time) * Math.exp(-time * 15) * 0.32 +
      Math.sin(2 * Math.PI * frequency * 6.15 * time) * Math.exp(-time * 25) * 0.08;
    const woodenTap = (random() * 2 - 1) * Math.exp(-time * 95) * 0.16;
    return attack(time, 0.0015) * (bar + woodenTap);
  });
}

function render(duration, sampleAt) {
  const length = Math.round(duration * SAMPLE_RATE);
  const samples = new Float64Array(length);
  let peak = 0;
  for (let index = 0; index < length; index += 1) {
    const time = index / SAMPLE_RATE;
    const fade = Math.min(1, (duration - time) / 0.035);
    samples[index] = sampleAt(time) * Math.max(0, fade);
    peak = Math.max(peak, Math.abs(samples[index]));
  }
  const scale = peak === 0 ? 1 : 0.72 / peak;
  return samples.map((sample) => sample * scale);
}

function attack(time, duration) {
  return Math.min(1, time / duration);
}

function seededNoise(initialState) {
  let state = initialState >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function encodeWav(samples) {
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  samples.forEach((sample, index) => {
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32_767), 44 + index * 2);
  });
  return buffer;
}

function runFfmpeg(arguments_) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...arguments_], {
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`ffmpeg failed with exit code ${String(result.status)}`);
}

function normalizeLoudness(source, output, loudness, truePeak) {
  let gain = 0;
  const limit = 10 ** (truePeak / 20);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    runFfmpeg([
      "-i",
      source,
      "-af",
      `volume=${gain}dB,alimiter=limit=${limit}:attack=5:release=50:level=false`,
      "-ar",
      String(SAMPLE_RATE),
      "-ac",
      "1",
      output,
    ]);
    const measured = measureLoudness(output);
    if (Math.abs(measured - loudness) < 0.1) return;
    gain += loudness - measured;
  }
  throw new Error(`Could not normalize ${source} to ${loudness} LUFS`);
}

function measureLoudness(source) {
  const analysis = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      source,
      "-af",
      "loudnorm=I=-18:TP=-2:LRA=7:print_format=json",
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  if (analysis.status !== 0)
    throw new Error(`ffmpeg loudness analysis failed with exit code ${String(analysis.status)}`);
  const json = analysis.stderr.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("ffmpeg did not return loudness measurements");
  const loudness = Number(JSON.parse(json).input_i);
  if (!Number.isFinite(loudness)) throw new Error(`Invalid loudness measurement for ${source}`);
  return loudness;
}
