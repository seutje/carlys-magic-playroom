export interface ScenePerformanceSummary {
  readonly scene: string;
  readonly samples: number;
  readonly averageFrameMs: number;
  readonly slowestFrameMs: number;
  readonly lastDrawCalls: number;
  readonly lastHeapBytes?: number;
}

export interface RoomLoadSummary {
  readonly room: string;
  readonly durationMs: number;
}

export interface PerformanceSummary {
  readonly scenes: readonly ScenePerformanceSummary[];
  readonly roomLoads: readonly RoomLoadSummary[];
}

interface MutableSceneSummary {
  samples: number;
  totalFrameMs: number;
  slowestFrameMs: number;
  lastDrawCalls: number;
  lastHeapBytes?: number;
}

const MAX_SCENES = 6;
const MAX_ROOM_LOADS = 20;
const scenes = new Map<string, MutableSceneSummary>();
let roomLoads: RoomLoadSummary[] = [];

export const performanceDiagnostics = {
  recordFrame(scene: string, frameMs: number, drawCalls: number, heapBytes?: number) {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return;
    if (!scenes.has(scene) && scenes.size >= MAX_SCENES) return;
    const current = scenes.get(scene) ?? {
      samples: 0,
      totalFrameMs: 0,
      slowestFrameMs: 0,
      lastDrawCalls: 0,
    };
    if (current.samples < 1_000) {
      current.samples += 1;
      current.totalFrameMs += frameMs;
    } else {
      current.totalFrameMs = current.totalFrameMs * 0.999 + frameMs;
    }
    current.slowestFrameMs = Math.max(current.slowestFrameMs, frameMs);
    current.lastDrawCalls = Math.max(0, Math.round(drawCalls));
    if (heapBytes !== undefined && Number.isFinite(heapBytes)) current.lastHeapBytes = heapBytes;
    scenes.set(scene, current);
  },
  recordRoomLoad(room: string, durationMs: number) {
    if (!Number.isFinite(durationMs) || durationMs < 0) return;
    roomLoads = [...roomLoads, { room, durationMs }].slice(-MAX_ROOM_LOADS);
  },
  read(): PerformanceSummary {
    return {
      scenes: [...scenes.entries()].map(([scene, value]) => ({
        scene,
        samples: value.samples,
        averageFrameMs: value.totalFrameMs / value.samples,
        slowestFrameMs: value.slowestFrameMs,
        lastDrawCalls: value.lastDrawCalls,
        ...(value.lastHeapBytes === undefined ? {} : { lastHeapBytes: value.lastHeapBytes }),
      })),
      roomLoads: [...roomLoads],
    };
  },
  clear() {
    scenes.clear();
    roomLoads = [];
  },
};
