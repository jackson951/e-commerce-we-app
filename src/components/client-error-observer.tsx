"use client";

import { useEffect } from "react";

const LOG_ENDPOINT = "/api/client-errors";

function sendClientError(payload: Record<string, unknown>) {
  const body = JSON.stringify({
    ...payload,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    timestamp: new Date().toISOString()
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(LOG_ENDPOINT, body);
    return;
  }

  fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => undefined);
}

export function ClientErrorObserver() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      sendClientError({
        type: "window_error",
        message: event.message,
        stack: event.error?.stack || null
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      sendClientError({
        type: "unhandled_rejection",
        message: typeof reason === "string" ? reason : reason?.message || "Unhandled rejection",
        stack: reason?.stack || null
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
