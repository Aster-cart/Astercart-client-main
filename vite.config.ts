import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const appVersion = env.VITE_APP_VERSION || "0.0.0";
  const release = `admin@${appVersion}`;

  const plugins = [
    react(),
    // Only upload source maps when the token is present, so local builds (and
    // CI without secrets) don't fail. Release must match the runtime SDK
    // release (src/lib/sentry.ts uses admin@<VITE_APP_VERSION>).
    ...(env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            authToken: env.SENTRY_AUTH_TOKEN,
            org: env.SENTRY_ORG_SLUG || env.SENTRY_ORG,
            project: env.SENTRY_PROJECT_SLUG || env.SENTRY_PROJECT,
            release: { name: release },
            sourcemaps: {
              assets: ["dist/assets/**"],
            },
            telemetry: false,
          }),
        ]
      : []),
  ];

  return {
    plugins,
    build: {
      sourcemap: true,
    },
  };
});
