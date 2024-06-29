import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
  ],
  // https://github.com/docker/for-mac/issues/7276#issuecomment-2166725643
  server: {
    host: '127.0.0.1'
  },
});
