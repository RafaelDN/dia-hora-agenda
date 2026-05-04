<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import CategoryBadge from './CategoryBadge.vue'
import { getCategoryStyle } from '../data/categories'
import type { RoutineItem } from '../types/routine'

const props = defineProps<{
  item: RoutineItem
  active?: boolean
  completed?: boolean
}>()

const emit = defineEmits<{
  select: [item: RoutineItem]
  toggleCompleted: [item: RoutineItem]
}>()

const categoryStyle = computed(() => getCategoryStyle(props.item.category))
const isCelebrating = ref(false)
let celebrationTimer: ReturnType<typeof window.setTimeout> | null = null

function handleSelect() {
  emit('select', props.item)
}

function handleToggleCompleted() {
  emit('toggleCompleted', props.item)
}

function handleCardKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  handleSelect()
}

watch(
  () => props.completed,
  (isCompleted, wasCompleted) => {
    if (!isCompleted || wasCompleted) {
      return
    }

    isCelebrating.value = true

    if (celebrationTimer) {
      window.clearTimeout(celebrationTimer)
    }

    celebrationTimer = window.setTimeout(() => {
      isCelebrating.value = false
      celebrationTimer = null
    }, 650)
  },
)

onBeforeUnmount(() => {
  if (celebrationTimer) {
    window.clearTimeout(celebrationTimer)
  }
})
</script>

<template>
  <article
    class="routine-print-chip routine-chip-shell card border bg-base-100/95 transition-all duration-200"
    :class="[
      completed
        ? 'routine-chip-completed border-emerald-500/55 shadow-md shadow-emerald-500/10'
        : 'border-[var(--category-border)] shadow-xs hover:-translate-y-0.5 hover:shadow-md',
      active ? 'ring-2 ring-[var(--category-accent)] ring-offset-1' : '',
      isCelebrating ? 'routine-chip-celebrating' : '',
    ]"
    :style="categoryStyle"
  >
    <div class="card-body gap-2 p-3 text-left">
      <div
        class="cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--category-accent)] focus-visible:ring-offset-2"
        role="button"
        tabindex="0"
        @click="handleSelect"
        @keydown="handleCardKeydown"
      >
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

      <button
        type="button"
        class="btn btn-sm mt-1"
        :class="completed ? 'btn-success text-white' : 'btn-outline btn-success'"
        @click="handleToggleCompleted"
      >
        {{ completed ? 'Tomado hoje' : 'Tomei?' }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.routine-chip-shell {
  transform-origin: center;
}

.routine-chip-completed {
  background:
    linear-gradient(180deg, color-mix(in srgb, #22c55e 12%, white), oklch(var(--b1)));
}

.routine-chip-celebrating {
  animation: routine-chip-pop 0.5s ease;
}

@keyframes routine-chip-pop {
  0% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.03);
  }

  100% {
    transform: scale(1);
  }
}
</style>
