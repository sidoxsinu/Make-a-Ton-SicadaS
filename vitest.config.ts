import { defineConfig } from "vitest/config";
import path from "path";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    testTimeout: 25000,
    hookTimeout: 25000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

