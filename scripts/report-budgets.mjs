import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { gzipSync } from "node:zlib";

const distribution = new URL("../dist/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL(".vite/manifest.json", distribution), "utf8"));

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
        return entry.isDirectory() ? filesBelow(path) : [path];
      }),
    )
  ).flat();
}

const files = await filesBelow(distribution);
const measurements = await Promise.all(
  files.map(async (url) => {
    const data = await readFile(url);
    return {
      file: relative(distribution.pathname, url.pathname),
      bytes: data.byteLength,
      gzipBytes: /\.(?:js|css|html|json|webmanifest)$/.test(url.pathname)
        ? gzipSync(data).byteLength
        : undefined,
      hash: createHash("sha256").update(data).digest("hex"),
    };
  }),
);

const entry = manifest["index.html"];
if (!entry?.file) throw new Error("The Vite entry is missing from the build manifest.");
const initialFiles = new Set([entry.file, ...(entry.css ?? [])]);
const initial = measurements.filter((item) => initialFiles.has(item.file));
const initialBytes = initial.reduce((total, item) => total + item.bytes, 0);
const initialGzipBytes = initial.reduce((total, item) => total + (item.gzipBytes ?? item.bytes), 0);
const rooms = Object.entries(manifest)
  .filter(([source]) => /^src\/rooms\/[^/]+\/module\.tsx$/.test(source))
  .map(([source, item]) => ({
    room: source.split("/")[2],
    file: item.file,
    bytes: item.file ? (measurements.find((value) => value.file === item.file)?.bytes ?? 0) : 0,
  }));
const audioBytes = measurements
  .filter((item) => item.file.startsWith("audio/") && /\.(?:mp3|ogg)$/.test(item.file))
  .reduce((total, item) => total + item.bytes, 0);
const modelBytes = measurements
  .filter((item) => item.file.startsWith("models/") && item.file.endsWith(".glb"))
  .reduce((total, item) => total + item.bytes, 0);
const majorAssets = measurements
  .filter((item) => /^(?:audio|icons|models)\//.test(item.file) && item.bytes >= 10_000)
  .map(({ file, bytes }) => ({ file, bytes }))
  .sort((left, right) => right.bytes - left.bytes);
const sharedThreeManifestEntry = Object.values(manifest).find(
  (item) => item.name === "FrameDiagnostics",
);
const sharedThree = sharedThreeManifestEntry?.file
  ? measurements.find((item) => item.file === sharedThreeManifestEntry.file)
  : undefined;
const duplicateGroups = Object.values(Object.groupBy(measurements, (item) => item.hash)).filter(
  (group) => group && group.length > 1,
);

const limits = {
  initialBytes: 300_000,
  initialGzipBytes: 100_000,
  roomBytes: 40_000,
  audioBytes: 600_000,
  modelBytes: 2_000_000,
  sharedThreeExceptionBytes: 900_000,
};
const violations = [
  initialBytes > limits.initialBytes ? `initial bytes ${initialBytes}` : null,
  initialGzipBytes > limits.initialGzipBytes ? `initial gzip bytes ${initialGzipBytes}` : null,
  ...rooms
    .filter((room) => room.bytes > limits.roomBytes)
    .map((room) => `${room.room} chunk ${room.bytes}`),
  audioBytes > limits.audioBytes ? `audio bytes ${audioBytes}` : null,
  modelBytes > limits.modelBytes ? `model bytes ${modelBytes}` : null,
  sharedThree && sharedThree.bytes > limits.sharedThreeExceptionBytes
    ? `shared 3D exception ${sharedThree.bytes}`
    : null,
].filter(Boolean);

const report = {
  generatedAt: new Date().toISOString(),
  initial: {
    files: initial.map((item) => item.file),
    bytes: initialBytes,
    gzipBytes: initialGzipBytes,
  },
  rooms,
  assets: {
    audioBytes,
    modelBytes,
    majorAssets,
    duplicateGroups: duplicateGroups.map((group) => group.map((item) => item.file)),
  },
  exceptions: sharedThree
    ? [
        {
          file: sharedThree.file,
          bytes: sharedThree.bytes,
          reason: "Shared declarative WebGL runtime, lazy-loaded only after Play.",
        },
      ]
    : [],
  limits,
  violations,
};

await writeFile(new URL("bundle-report.json", distribution), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (violations.length > 0) throw new Error(`Build budgets exceeded: ${violations.join(", ")}`);
