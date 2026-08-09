import * as Sentry from "@sentry/react";

const APP_NAME = "admin";

const SENSITIVE_KEYS = [
  "token",
  "refreshToken",
  "refresh_token",
  "idToken",
  "id_token",
  "password",
  "passcode",
  "authorization",
  "apiKey",
  "api_key",
  "apikey",
  "secret",
  "otp",
  "verificationCode",
  "governmentId",
  "government_id",
  "selfie",
  "licenseNumber",
  "license_number",
  "numberPlate",
  "number_plate",
  "nuban",
  "bvn",
  "accountNumber",
  "account_number",
  "cardNumber",
  "card_number",
  "cvv",
  "cvv2",
  "idDocument",
  "id_document",
  "kyc",
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((k) => lower.includes(k.toLowerCase()));
}

function redactValue(value: unknown): unknown {
  return typeof value === "string" ? "[REDACTED]" : value;
}

function redactNode(node: unknown, depth = 0): unknown {
  if (node === null || typeof node !== "object" || depth > 6) return node;
  if (Array.isArray(node)) {
    return node.map((item) => redactNode(item, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      out[key] = redactValue(value);
    } else if (value && typeof value === "object") {
      out[key] = redactNode(value, depth + 1);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function sanitizeEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  if (event.extra) event.extra = redactNode(event.extra) as Sentry.ErrorEvent["extra"];
  if (event.request?.headers) {
    event.request.headers = redactNode(event.request.headers) as typeof event.request.headers;
  }
  if (event.request?.data) {
    event.request.data = redactNode(event.request.data) as typeof event.request.data;
  }
  for (const ex of event.exception?.values ?? []) {
    for (const frame of ex.stacktrace?.frames ?? []) {
      if (frame.vars) frame.vars = redactNode(frame.vars) as typeof frame.vars;
    }
  }
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs.map((crumb) => {
      if (crumb.data) crumb.data = redactNode(crumb.data) as typeof crumb.data;
      return crumb;
    });
  }
  return event;
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) {
    console.warn("[Sentry] VITE_SENTRY_DSN not set — Sentry disabled.");
    return;
  }

  const version = import.meta.env.VITE_APP_VERSION as string | undefined ?? "0.0.0";
  const environment =
    (import.meta.env.VITE_APP_ENV as string | undefined) ??
    (import.meta.env.PROD ? "production" : "development");

  Sentry.init({
    dsn,
    environment,
    release: `${APP_NAME}@${version}`,
    tracesSampleRate: 0.2,
    beforeSend: (event) => sanitizeEvent(event),
  });

  Sentry.setTag("app", APP_NAME);
  Sentry.setTag("surface", "admin");
}

export function setSentryUser(user: {
  id?: string;
  email?: string;
  userType?: string;
  role?: string;
} | null): void {
  if (!user?.id) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.userType === "Admin" ? "admin" : "user",
  });
  Sentry.setTag("userType", user.userType ?? "unknown");
  if (user.role) Sentry.setTag("adminRole", user.role);
}

export { Sentry };
