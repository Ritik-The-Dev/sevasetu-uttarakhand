// Local (on-device) storage for the demo. Nothing personal is sent to a server.
import { useEffect, useState } from "react";

const listeners = new Set<() => void>();
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, v: T) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    // Storage may be full or unavailable; the in-memory UI still updates.
  }
  listeners.forEach((l) => l());
}

export function readStored<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

export function writeStored<T>(key: string, value: T) {
  write(key, value);
}

export function clearStoredData() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith("sevasetu.")) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
  listeners.forEach((l) => l());
}

export function useStored<T>(key: string, fallback: T): [T, (v: T | ((c: T) => T)) => void] {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    const sync = () => setVal(read(key, fallback));
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = (v: T | ((c: T) => T)) => {
    const next = typeof v === "function" ? (v as (c: T) => T)(read(key, fallback)) : v;
    write(key, next);
  };
  return [val, set];
}

export const KEYS = {
  recent: "sevasetu.recent",
  saved: "sevasetu.saved",
  checklist: (id: string) => `sevasetu.checklist.${id}`,
  guide: (id: string) => `sevasetu.guide.${id}`,
  conversations: "sevasetu.conversations",
};

export function pushRecent(id: string) {
  const cur = read<string[]>(KEYS.recent, []);
  write(KEYS.recent, [id, ...cur.filter((x) => x !== id)].slice(0, 8));
}
