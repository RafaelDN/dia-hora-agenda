const storageKey = 'routine-daily-log'

type RoutineDailyLog = {
  date: string
  completedItemIds: string[]
}

export function readRoutineDailyLog() {
  if (typeof window === 'undefined') {
    return new Set<string>()
  }

  const rawValue = window.localStorage.getItem(storageKey)

  if (!rawValue) {
    return new Set<string>()
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<RoutineDailyLog>
    const today = getTodayKey()

    if (
      parsedValue.date !== today ||
      !Array.isArray(parsedValue.completedItemIds) ||
      !parsedValue.completedItemIds.every((itemId) => typeof itemId === 'string')
    ) {
      window.localStorage.removeItem(storageKey)
      return new Set<string>()
    }

    return new Set(parsedValue.completedItemIds)
  } catch {
    window.localStorage.removeItem(storageKey)
    return new Set<string>()
  }
}

export function writeRoutineDailyLog(completedItemIds: Iterable<string>) {
  if (typeof window === 'undefined') {
    return
  }

  const payload: RoutineDailyLog = {
    date: getTodayKey(),
    completedItemIds: Array.from(new Set(completedItemIds)),
  }

  window.localStorage.setItem(storageKey, JSON.stringify(payload))
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
