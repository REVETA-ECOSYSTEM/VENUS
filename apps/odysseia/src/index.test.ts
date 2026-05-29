import assert from "node:assert/strict";
import test from "node:test";
import { moduleName } from "./index.js";

test("module exports its name", () => {
  assert.equal(moduleName, "@venus/odysseia");
});
