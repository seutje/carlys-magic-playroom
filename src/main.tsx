import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { RootErrorBoundary } from "./app/RootErrorBoundary";
import { registerServiceWorker } from "./engine/offline/registerServiceWorker";
import "./app/app.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root is unavailable");
}

createRoot(rootElement).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

void registerServiceWorker();
