// ─────────────────────────────────────────────────────────────
//  Hero Explorer v2 — Dev debug log store
// ─────────────────────────────────────────────────────────────
// Backs the black debug console footer (components/debug/DebugConsole.tsx).
// A tiny module-level pub-sub: anything (the fetch helper in lib/api.ts, a
// patched window.console, global error listeners) can push a log entry from
// anywhere — including plain non-React modules — and the console component
// re-renders via a window CustomEvent rather than React context, since a lot
// of the sources here aren't React at all.
//
// Everything in this file is a guarded no-op outside development, so it
// never runs (or leaks request/response bodies) in production.

export type DebugLogType = 'api' | 'console' | 'error';
export type DebugLogLevel = 'log' | 'info' | 'warn' | 'error';

export interface DebugLogEntry {
  id: string;
  timestamp: number;
  type: DebugLogType;
  level: DebugLogLevel;
  summary: string;
  details?: unknown;
}

export const DEBUG_LOG_EVENT = 'hero-debug-log';
const MAX_LOGS = 300;
const isDev = process.env.NODE_ENV === 'development';

let logs: DebugLogEntry[] = [];
let idCounter = 0;

function replacer(_key: string, value: unknown) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

/** Pretty-print a value for the expandable detail block, tolerating circular refs and Error objects. */
export function safeStringify(value: unknown): string {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, replacer, 2);
  } catch {
    return String(value);
  }
}

function argToString(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function pushDebugLog(entry: Omit<DebugLogEntry, 'id' | 'timestamp'>): void {
  if (!isDev || typeof window === 'undefined') return;
  const full: DebugLogEntry = { ...entry, id: `${Date.now()}-${idCounter++}`, timestamp: Date.now() };
  logs = [...logs, full].slice(-MAX_LOGS);
  window.dispatchEvent(new CustomEvent<DebugLogEntry>(DEBUG_LOG_EVENT, { detail: full }));
}

/** Convenience wrapper for lib/api.ts's request() — one call per fetch, success or failure. */
export function logApiCall(info: {
  method: string;
  path: string;
  status: number;
  ok: boolean;
  durationMs: number;
  body?: unknown;
  error?: unknown;
}): void {
  const { method, path, status, ok, durationMs, body, error } = info;
  const summary = `${method} ${path} → ${status || 'ERR'} (${Math.round(durationMs)}ms)`;
  pushDebugLog({
    type: 'api',
    level: ok ? 'log' : 'error',
    summary,
    details: error !== undefined ? { error: safeStringify(error), body } : body,
  });
}

export function getDebugLogs(): DebugLogEntry[] {
  return logs;
}

export function clearDebugLogs(): void {
  logs = [];
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<null>(DEBUG_LOG_EVENT, { detail: null }));
  }
}

let installed = false;

/**
 * Patches window.console (log/warn/error) and window error/unhandledrejection
 * listeners to also feed the debug log. Idempotent — safe to call from every
 * DebugConsole mount (including React Strict Mode's double-invoke and Fast
 * Refresh) without double-patching.
 */
export function installDebugCapture(): void {
  if (!isDev || installed || typeof window === 'undefined') return;
  installed = true;

  const original = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  (Object.keys(original) as Array<keyof typeof original>).forEach((level) => {
    console[level] = (...args: unknown[]) => {
      original[level](...args);
      pushDebugLog({
        type: 'console',
        level,
        summary: args.map(argToString).join(' '),
        details: args.length <= 1 ? args[0] : args,
      });
    };
  });

  window.addEventListener('error', (event: ErrorEvent) => {
    pushDebugLog({
      type: 'error',
      level: 'error',
      summary: event.message || 'Uncaught error',
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason as { message?: string; stack?: string } | undefined;
    pushDebugLog({
      type: 'error',
      level: 'error',
      summary: `Unhandled rejection: ${reason?.message ?? String(event.reason)}`,
      details: reason?.stack ?? event.reason,
    });
  });
}
