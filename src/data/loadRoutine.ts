import { routineCategories, type RoutineCategory, type RoutineItem } from '../types/routine'

const dataUrl = `${import.meta.env.BASE_URL}data.json`
const validCategories = new Set<RoutineCategory>(routineCategories)

export async function loadRoutine(): Promise<RoutineItem[]> {
  const response = await fetch(dataUrl)

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar a rotina.')
  }

  const payload: unknown = await response.json()

  if (!Array.isArray(payload)) {
    throw new Error('Formato invalido em data.json.')
  }

  const routine = payload.map(parseRoutineItem)

  return routine.sort((left, right) => left.time.localeCompare(right.time))
}

function parseRoutineItem(value: unknown): RoutineItem {
  if (!value || typeof value !== 'object') {
    throw new Error('Cada item da rotina precisa ser um objeto.')
  }

  const item = value as Record<string, unknown>

  if (
    typeof item.id !== 'string' ||
    typeof item.time !== 'string' ||
    typeof item.title !== 'string' ||
    typeof item.summary !== 'string'
  ) {
    throw new Error('Campos obrigatorios ausentes ou invalidos em data.json.')
  }

  if (!isRoutineCategory(item.category)) {
    throw new Error(`Categoria invalida encontrada: ${String(item.category)}`)
  }

  const tags =
    item.tags === undefined
      ? undefined
      : Array.isArray(item.tags) && item.tags.every((tag) => typeof tag === 'string')
        ? item.tags
        : undefined

  return {
    id: item.id,
    time: item.time,
    title: item.title,
    category: item.category,
    summary: item.summary,
    tags,
    markdown: typeof item.markdown === 'string' ? item.markdown : undefined,
  }
}

function isRoutineCategory(value: unknown): value is RoutineCategory {
  return typeof value === 'string' && validCategories.has(value as RoutineCategory)
}
