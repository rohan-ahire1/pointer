import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest.config.mts doesn't set `test.globals: true`, so @testing-library/react
// can't auto-detect a global `afterEach` to register its own cleanup —
// without this, unmounted trees from a previous test stay in the DOM and
// later queries (getByRole, getByText, ...) can match stale elements.
afterEach(() => {
  cleanup();
});
