<script setup lang="ts">
import { computed } from 'vue'

import CategoryBadge from './CategoryBadge.vue'
import { getCategoryStyle } from '../data/categories'
import type { RoutineItem } from '../types/routine'

const props = defineProps<{
  item: RoutineItem
  active?: boolean
}>()

const emit = defineEmits<{
  select: [item: RoutineItem]
}>()

const categoryStyle = computed(() => getCategoryStyle(props.item.category))
function handleSelect() {
  emit('select', props.item)
}
</script>

<template>
  <button
    type="button"
    class="card border-[var(--category-border)] bg-base-100/95 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
    :class="active ? 'ring-2 ring-[var(--category-accent)] ring-offset-1 shadow-md' : 'shadow-xs'"
    :style="categoryStyle"
    @click="handleSelect"
  >
    <div class="card-body gap-2 p-3 text-left">
      <div class="flex items-start justify-between gap-2">
        <CategoryBadge :category="item.category" />
      </div>

      <div class="space-y-0.5">
        <h3 class="text-sm font-semibold text-base-content">{{ item.title }}</h3>
        <p class="text-xs leading-5 text-base-content/70">{{ item.summary }}</p>
      </div>

      <div class="mt-1 flex flex-wrap gap-1">
        <span v-for="tag in item.tags ?? []" :key="tag" class="badge badge-ghost badge-xs">
          {{ tag }}
        </span>
      </div>
    </div>
  </button>
</template>
