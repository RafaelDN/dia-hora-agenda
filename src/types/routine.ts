export const routineCategories = [
  'medicine',
  'phytotherapy',
  'supplement',
  'meal',
  'snack',
] as const

export type RoutineCategory = (typeof routineCategories)[number]

export interface RoutineItem {
  id: string
  time: string
  title: string
  category: RoutineCategory
  summary: string
  tags?: string[]
  markdown?: string
}

export interface TimeGroup {
  time: string
  items: RoutineItem[]
}
