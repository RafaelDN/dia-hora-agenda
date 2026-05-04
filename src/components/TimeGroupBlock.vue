<script setup lang="ts">
import RoutineChip from './RoutineChip.vue'
import type { RoutineItem, TimeGroup } from '../types/routine'

defineProps<{
  group: TimeGroup
  activeItemId?: string
  completedItemIds?: string[]
}>()

const emit = defineEmits<{
  select: [item: RoutineItem]
  toggleCompleted: [item: RoutineItem]
}>()

function handleSelect(item: RoutineItem) {
  emit('select', item)
}

function handleToggleCompleted(item: RoutineItem) {
  emit('toggleCompleted', item)
}
</script>

<template>
  <section class="routine-time-group grid gap-2 lg:grid-cols-[4.5rem_minmax(0,1fr)]">
    <div class="routine-time-label top-4 flex items-start lg:sticky">
      <span class="badge badge-lg border-base-300 bg-base-100 font-bold shadow-sm">
        {{ group.time }}
      </span>
    </div>

    <div class="routine-time-grid grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <RoutineChip
        v-for="item in group.items"
        :key="item.id"
        :item="item"
        :active="item.id === activeItemId"
        :completed="completedItemIds?.includes(item.id)"
        @select="handleSelect"
        @toggle-completed="handleToggleCompleted"
      />
    </div>
  </section>
</template>
