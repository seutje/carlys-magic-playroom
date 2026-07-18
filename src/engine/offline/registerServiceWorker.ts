import { diagnostics } from "../diagnostics/diagnostics";

interface RegistrationEnvironment {
  readonly production: boolean;
  readonly serviceWorker?: Pick<ServiceWorkerContainer, "register">;
}

export async function registerServiceWorker(
  environment: RegistrationEnvironment = {
    production: import.meta.env.PROD,
    ...(typeof navigator === "undefined" || !("serviceWorker" in navigator)
      ? {}
      : { serviceWorker: navigator.serviceWorker }),
  },
): Promise<ServiceWorkerRegistration | undefined> {
  if (!environment.production || !environment.serviceWorker) return undefined;

  try {
    return await environment.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    });
  } catch {
    diagnostics.record({ category: "asset", code: "service-worker-registration-failed" });
    return undefined;
  }
}
