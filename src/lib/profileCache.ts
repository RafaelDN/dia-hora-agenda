import type { JournalEntry } from '../types/journalEntry'
import type { UserFileRecord } from '../types/userFile'

type CachedProfileFiles = {
  records: UserFileRecord[]
  cachedAt: string
}

type CachedJournalEntries = {
  entries: JournalEntry[]
  cachedAt: string
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readCache<T>(key: string) {
  if (!isBrowser()) {
    return null
  }

  const rawValue = window.localStorage.getItem(key)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

function writeCache<T>(key: string, value: T) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function readCachedProfileFiles(userId: string) {
  return readCache<CachedProfileFiles>(`profile-files:${userId}`)
}

export function writeCachedProfileFiles(userId: string, records: UserFileRecord[]) {
  writeCache(`profile-files:${userId}`, {
    records,
    cachedAt: new Date().toISOString(),
  })
}

export function readCachedJournalEntries(userId: string) {
  return readCache<CachedJournalEntries>(`journal-entries:${userId}`)
}

export function writeCachedJournalEntries(userId: string, entries: JournalEntry[]) {
  writeCache(`journal-entries:${userId}`, {
    entries,
    cachedAt: new Date().toISOString(),
  })
}
