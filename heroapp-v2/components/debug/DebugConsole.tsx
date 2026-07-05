'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DEBUG_LOG_EVENT,
  clearDebugLogs,
  getDebugLogs,
  installDebugCapture,
  safeStringify,
  type DebugLogEntry,
  type DebugLogType,
} from '@/lib/debugLog';

// Dev-only black debug console pinned to the bottom of every page. Collapses
// to a small pill by default; expand to see every API call (method, path,
// status, timing, response/error body), captured console.log/warn/error, and
// uncaught errors/unhandled rejections — all in one place instead of having
// to cross-reference the terminal and the browser console.
//
// Wrapper here is intentionally hook-free so the NODE_ENV check can bail out
// before any hooks run without violating the rules of hooks.
export default function DebugConsole() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <DebugConsoleInner />;
}

type Filter = 'all' | DebugLogType;

const FILTERS: Filter[] = ['all', 'api', 'console', 'error'];

function levelColor(entry: DebugLogEntry): string {
  if (entry.level === 'error') return '#ff6b6b';
  if (entry.level === 'warn') return '#ffd93d';
  if (entry.type === 'api') return '#4ade80';
  return '#e5e5e5';
}

function DebugConsoleInner() {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    installDebugCapture();
    setLogs(getDebugLogs());
    const handler = () => setLogs(getDebugLogs());
    window.addEventListener(DEBUG_LOG_EVENT, handler);
    return () => window.removeEventListener(DEBUG_LOG_EVENT, handler);
  }, []);

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, expanded]);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter);
  const errorCount = logs.filter((l) => l.level === 'error').length;

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Open debug console"
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          zIndex: 9999,
          background: '#000',
          color: errorCount > 0 ? '#ff6b6b' : '#fff',
          border: '1px solid #333',
          borderRadius: 999,
          padding: '6px 14px',
          fontSize: 12,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        ● Debug ({logs.length})
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        height: 340,
        maxHeight: '60vh',
        background: '#000',
        color: '#e5e5e5',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid #222',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderBottom: '1px solid #222',
          background: '#0a0a0a',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <strong style={{ color: '#fff', marginRight: 4 }}>Debug Console</strong>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#333' : 'transparent',
                color: filter === f ? '#fff' : '#999',
                border: '1px solid #333',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => clearDebugLogs()}
            style={{
              background: 'transparent',
              color: '#999',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close debug console"
            style={{
              background: 'transparent',
              color: '#999',
              border: '1px solid #333',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 10px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#555', padding: '8px 0' }}>No logs yet.</div>
        ) : (
          filtered.map((entry) => <LogLine key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: DebugLogEntry }) {
  const color = levelColor(entry);
  const time = new Date(entry.timestamp).toLocaleTimeString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const details = entry.details !== undefined ? safeStringify(entry.details) : '';

  return (
    <details style={{ borderBottom: '1px solid #161616', padding: '3px 0' }}>
      <summary style={{ cursor: 'pointer', color, listStyle: 'none', wordBreak: 'break-all' }}>
        <span style={{ color: '#666' }}>{time}</span>{' '}
        <span style={{ fontSize: 10, color: '#777' }}>[{entry.type}]</span>{' '}
        {entry.summary}
      </summary>
      {details && (
        <pre
          style={{
            margin: '4px 0 4px 16px',
            color: '#aaa',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {details}
        </pre>
      )}
    </details>
  );
}
