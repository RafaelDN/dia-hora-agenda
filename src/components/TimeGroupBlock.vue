<script setup lang="ts">
import RoutineChip from './RoutineChip.vue'
import type { RoutineItem, TimeGroup } from '../types/routine'

defineProps<{
  group: TimeGroup
  activeItemId?: string
}>()

const emit = defineEmits<{
  select: [item: RoutineItem]
}>()

function handleSelect(item: RoutineItem) {
  emit('select', item)
}
</script>

<template>
  <section class="grid gap-2 lg:grid-cols-[4.5rem_minmax(0,1fr)]">
    <div class="top-4 flex items-start lg:sticky">
      <span class="badge badge-lg border-base-300 bg-base-100 font-bold shadow-sm">
        {{ group.time }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <RoutineChip
        v-for="item in group.items"
        :key="item.id"
        :item="item"
        :active="item.id === activeItemId"
        @select="handleSelect"
      />
    </div>
  </section>
</template>
