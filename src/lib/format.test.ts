import { describe, it, expect } from "vitest";
import { balance } from "./format";

describe("balance", () => {
  it("only charges completed sessions", () => {
    expect(balance([{ amount: 500 }], [{ price: 800, status: "completada" }, { price: 800, status: "programada" }])).toBe(-300);
  });
});
