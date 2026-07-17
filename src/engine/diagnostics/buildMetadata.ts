export interface BuildMetadata {
  readonly version: string;
  readonly commit: string;
  readonly builtAt: string;
}

export const buildMetadata: BuildMetadata = Object.freeze({
  version: __BUILD_VERSION__,
  commit: __BUILD_COMMIT__,
  builtAt: __BUILD_DATE__,
});
