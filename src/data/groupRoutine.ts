import type { RoutineItem, TimeGroup } from '../types/routine'

export function groupRoutineByTime(items: RoutineItem[]): TimeGroup[] {
  const sortedItems = [...items].sort((left, right) => {
    const timeOrder = left.time.localeCompare(right.time)

    if (timeOrder !== 0) {
      return timeOrder
    }

    return left.title.localeCompare(right.title)
  })

  const groupedItems = new Map<string, RoutineItem[]>()

  for (const item of sortedItems) {
    const itemsAtTime = groupedItems.get(item.time) ?? []
    itemsAtTime.push(item)
    groupedItems.set(item.time, itemsAtTime)
  }

  return Array.from(groupedItems.entries()).map(([time, grouped]) => ({
    time,
    items: grouped,
  }))
}
