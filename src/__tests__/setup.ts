import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation globally
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'mock-id' }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock crypto.randomUUID in jsdom
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => {
      // Simple deterministic UUID for tests
      let counter = 0;
      return `test-uuid-${++counter}-${Date.now()}`;
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
  },
  writable: true,
});

// Suppress noisy console.error for expected React warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    // Suppress known React 19 test warnings
    if (
      msg.includes('Warning: ReactDOM.render') ||
      msg.includes('act(...)') ||
      msg.includes('Warning: An update to')
    ) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
