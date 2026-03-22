const LOG_KEY = 'eduplatform_error_log';
const MAX_LOGS = 200;

export interface ErrorLogEntry {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  source: string;
  stack?: string;
  url?: string;
  userId?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getStoredLogs(): ErrorLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistLogs(logs: ErrorLogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
}

function addLog(entry: Omit<ErrorLogEntry, 'id' | 'timestamp'>) {
  const logs = getStoredLogs();
  const newEntry: ErrorLogEntry = {
    ...entry,
    id: genId(),
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };
  logs.unshift(newEntry);
  persistLogs(logs);

  // Also print to console in dev
  if (import.meta.env.DEV) {
    const method = entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warn' : 'log';
    console[method](`[${entry.source}]`, entry.message, entry.stack || '', entry.meta || '');
  }
}

export const errorLogger = {
  error(message: string, source: string, opts?: { stack?: string; meta?: Record<string, unknown> }) {
    addLog({ level: 'error', message, source, ...opts });
  },

  warn(message: string, source: string, opts?: { meta?: Record<string, unknown> }) {
    addLog({ level: 'warn', message, source, ...opts });
  },

  info(message: string, source: string, opts?: { meta?: Record<string, unknown> }) {
    addLog({ level: 'info', message, source, ...opts });
  },

  getLogs(): ErrorLogEntry[] {
    return getStoredLogs();
  },

  clearLogs() {
    localStorage.removeItem(LOG_KEY);
  },

  downloadLogs() {
    const logs = getStoredLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduplatform-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ─── Global error handlers ──────────────────────────────

window.addEventListener('error', (event) => {
  errorLogger.error(event.message, 'window.onerror', {
    stack: event.error?.stack,
    meta: { filename: event.filename, lineno: event.lineno, colno: event.colno },
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
  const stack = event.reason instanceof Error ? event.reason.stack : undefined;
  errorLogger.error(`Unhandled promise rejection: ${message}`, 'unhandledrejection', { stack });
});
