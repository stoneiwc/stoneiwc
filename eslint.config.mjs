import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

// `next lint` was removed in Next 16, so ESLint runs directly (`pnpm lint`).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Studio is a separate app with its own eslint.config.mjs.
    "studio/**",
  ]),
])
