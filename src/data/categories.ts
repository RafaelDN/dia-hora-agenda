import type { CSSProperties } from 'vue'

import type { RoutineCategory } from '../types/routine'

interface CategoryMeta {
  label: string
  description: string
  accent: string
  surface: string
  border: string
}

export const categoryMetaMap: Record<RoutineCategory, CategoryMeta> = {
  medicine: {
    label: 'Medicamento',
    description: 'Uso medicinal',
    accent: '#2f9e5b',
    surface: 'rgba(47, 158, 91, 0.12)',
    border: 'rgba(47, 158, 91, 0.24)',
  },
  phytotherapy: {
    label: 'Fitoterápico',
    description: 'Base vegetal',
    accent: '#d97706',
    surface: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.24)',
  },
  supplement: {
    label: 'Suplemento',
    description: 'Suporte nutricional',
    accent: '#2b6de5',
    surface: 'rgba(43, 109, 229, 0.12)',
    border: 'rgba(43, 109, 229, 0.24)',
  },
  meal: {
    label: 'Refeição',
    description: 'Refeição principal',
    accent: '#8e44ad',
    surface: 'rgba(142, 68, 173, 0.12)',
    border: 'rgba(142, 68, 173, 0.24)',
  },
  snack: {
    label: 'Lanche',
    description: 'Reforço rápido',
    accent: '#8e44ad',
    surface: 'rgba(142, 68, 173, 0.12)',
    border: 'rgba(142, 68, 173, 0.24)',
  },
}

export function getCategoryMeta(category: RoutineCategory) {
  return categoryMetaMap[category]
}

export function getCategoryStyle(category: RoutineCategory): CSSProperties {
  const meta = getCategoryMeta(category)

  return {
    '--category-accent': meta.accent,
    '--category-surface': meta.surface,
    '--category-border': meta.border,
  } as CSSProperties
}
