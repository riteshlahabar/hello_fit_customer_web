import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The converted demo routes keep the client's own <img> tags.
    //
    // next/image needs either explicit width/height or `fill` with a positioned parent;
    // the demo supplies neither, so converting would change layout — and the whole point
    // of these pages is that they match the approved design pixel for pixel. The photos
    // are Unsplash placeholders that get replaced by real provider images on the project's
    // own CDN before launch, which is when next/image becomes worth doing.
    //
    // Hand-written components (src/components, src/app/(site)) are NOT exempt and do use
    // next/image.
    files: ['src/app/*/page.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
