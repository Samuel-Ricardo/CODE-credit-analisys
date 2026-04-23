"use client";

/**
 * Simple localStorage adapter with SSR-safe guards and JSON serialisation.
 * Follows the Adapter pattern: wraps localStorage behind a consistent interface.
 */
export class LocalStorageAdapter {
  private readonly prefix: string;

  constructor(prefix = "vv_credit") {
    this.prefix = prefix;
  }

  private key(name: string): string {
    return `${this.prefix}:${name}`;
  }

  private isAvailable(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  get<T>(name: string): T | null {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(this.key(name));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  set<T>(name: string, value: T): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value));
    } catch {
      // Storage quota exceeded — silently fail in demo mode
    }
  }

  remove(name: string): void {
    if (!this.isAvailable()) return;
    localStorage.removeItem(this.key(name));
  }

  clear(): void {
    if (!this.isAvailable()) return;
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(this.prefix),
    );
    keys.forEach((k) => localStorage.removeItem(k));
  }
}
