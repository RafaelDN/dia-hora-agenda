<script setup lang="ts">
import TimeGroupBlock from './TimeGroupBlock.vue'
import type { RoutineItem, TimeGroup } from '../types/routine'

defineProps<{
  groups: TimeGroup[]
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
  <div class="space-y-3">
    <TimeGroupBlock
      v-for="group in groups"
      :key="group.time"
      :group="group"
      :active-item-id="activeItemId"
      :completed-item-ids="completedItemIds"
      @select="handleSelect"
      @toggle-completed="handleToggleCompleted"
    />
  </div>
</template>
