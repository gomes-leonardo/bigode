import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run test files sequentially to avoid database race conditions
    // E2E tests share the same database, so parallel execution causes conflicts
    fileParallelism: false,
    // Run tests within a file sequentially
    sequence: {
      concurrent: false,
    },
  },
});
