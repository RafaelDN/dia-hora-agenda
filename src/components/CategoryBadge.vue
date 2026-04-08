<script setup lang="ts">
import { computed } from 'vue'

import { getCategoryMeta, getCategoryStyle } from '../data/categories'
import type { RoutineCategory } from '../types/routine'

const props = defineProps<{
  category: RoutineCategory
}>()

const meta = computed(() => getCategoryMeta(props.category))
const categoryStyle = computed(() => getCategoryStyle(props.category))
</script>

<template>
  <span
    class="badge badge-sm gap-1.5 border-[var(--category-border)] bg-[var(--category-surface)] font-semibold text-[var(--category-accent)] shadow-sm"
    :style="categoryStyle"
  >
    <span
      aria-hidden="true"
      class="inline-block h-2 w-2 rounded-full bg-[var(--category-accent)]"
    ></span>
    {{ meta.label }}
  </span>
</template>
