<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import DetailPanel from '../components/DetailPanel.vue'
import RoutineTimeline from '../components/RoutineTimeline.vue'
import { groupRoutineByTime } from '../data/groupRoutine'
import { loadRoutine } from '../data/loadRoutine'
import type { RoutineItem } from '../types/routine'

const items = ref<RoutineItem[]>([])
const activeItemId = ref<string>('')
const isLoading = ref(true)
const errorMessage = ref('')

const groupedItems = computed(() => groupRoutineByTime(items.value))
const activeItem = computed(
  () => items.value.find((item) => item.id === activeItemId.value) ?? null,
)
const isMobile = ref(false)
const mobileDetailModal = ref<HTMLDialogElement | null>(null)
let mediaQuery: MediaQueryList | null = null

onMounted(async () => {
  mediaQuery = window.matchMedia('(max-width: 767px)')
  updateMobileState(mediaQuery)
  mediaQuery.addEventListener('change', updateMobileState)

  try {
    const routine = await loadRoutine()
    items.value = routine;    
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar a rotina.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateMobileState)
})

function handleSelect(item: RoutineItem) {
  activeItemId.value = item.id

  if (isMobile.value) {
    mobileDetailModal.value?.showModal()
  }
}

function updateMobileState(query: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = query.matches

  if (!isMobile.value && mobileDetailModal.value?.open) {
    mobileDetailModal.value.close()
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-7xl flex-col gap-3 p-3 lg:p-4">
    <div v-if="isLoading" class="alert alert-info shadow-sm">
      <span>Carregando a rotina a partir do arquivo local `data.json`.</span>
    </div>

    <div v-else-if="errorMessage" class="alert alert-error shadow-sm">
      <span>{{ errorMessage }}</span>
    </div>

    <section v-else class="grid gap-3 xl:grid-cols-[minmax(0,1.75fr)_22rem]">
      <div class="card border border-base-300 bg-base-100/90 shadow-sm">
        <div class="card-body gap-3 p-3 lg:p-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
                Timeline
              </span>              
            </div>            
          </div>

          <RoutineTimeline
            :groups="groupedItems"
            :active-item-id="activeItemId"
            @select="handleSelect"
          />
        </div>
      </div>

      <div class="hidden space-y-2 md:block">
        <div class="px-1">
          <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
            Detalhes
          </span>          
        </div>

        <DetailPanel :item="activeItem" />
      </div>
    </section>

    <dialog ref="mobileDetailModal" class="modal md:hidden">
      <div class="modal-box relative max-h-[92vh] max-w-lg overflow-y-auto bg-transparent px-0 pb-0 pt-12 shadow-none">
        <form method="dialog" class="absolute right-3 top-3 z-20">
          <button
            class="btn btn-circle btn-sm border-error/25 bg-error/12 text-error shadow-sm hover:bg-error/20"
            aria-label="Fechar detalhes"
          >
            ✕
          </button>
        </form>

        <DetailPanel :item="activeItem" />
      </div>

      <form method="dialog" class="modal-backdrop">
        <button>fechar</button>
      </form>
    </dialog>
  </main>
</template>
