import { describe, expect, it, vi } from "vitest";
import { getStoredTheme, isTheme, setStoredTheme, THEME_STORAGE_KEY } from "./theme";

function throwingStorage() {
  return {
    getItem: vi.fn(() => {
      throw new Error("storage blocked");
    }),
    setItem: vi.fn(() => {
      throw new Error("storage blocked");
    }),
  };
}

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    store,
  };
}

describe("isTheme", () => {
  it("accepts the three valid theme values", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isTheme("purple")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
    expect(isTheme(1)).toBe(false);
  });
});

describe("getStoredTheme", () => {
  it("falls back to system when localStorage.getItem throws", () => {
    expect(getStoredTheme(throwingStorage())).toBe("system");
  });

  it("falls back to system for a missing value", () => {
    expect(getStoredTheme(memoryStorage())).toBe("system");
  });

  it("falls back to system for an invalid stored value", () => {
    const storage = memoryStorage();
    storage.store.set(THEME_STORAGE_KEY, "purple");
    expect(getStoredTheme(storage)).toBe("system");
  });

  it("returns a validly stored theme", () => {
    const storage = memoryStorage();
    storage.store.set(THEME_STORAGE_KEY, "dark");
    expect(getStoredTheme(storage)).toBe("dark");
  });
});

describe("setStoredTheme", () => {
  it("does not throw when localStorage.setItem throws", () => {
    expect(() => setStoredTheme("dark", throwingStorage())).not.toThrow();
  });

  it("persists the theme under the pointer:theme key", () => {
    const storage = memoryStorage();
    setStoredTheme("light", storage);
    expect(storage.store.get(THEME_STORAGE_KEY)).toBe("light");
  });
});
