<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CategoryBadge from './CategoryBadge.vue'
import MarkdownContent from './MarkdownContent.vue'
import { getCategoryStyle } from '../data/categories'
import { loadMarkdownDocument } from '../data/loadMarkdown'
import type { RoutineItem } from '../types/routine'

const props = defineProps<{
  item: RoutineItem | null
}>()

const categoryStyle = computed(() =>
  props.item ? getCategoryStyle(props.item.category) : undefined,
)

const markdownContent = ref('')
const markdownError = ref('')
const isMarkdownLoading = ref(false)

watch(
  () => props.item?.markdown,
  async (markdownFile) => {
    markdownContent.value = ''
    markdownError.value = ''

    if (!markdownFile) {
      return
    }

    isMarkdownLoading.value = true

    try {
      markdownContent.value = await loadMarkdownDocument(markdownFile)
    } catch (error) {
      markdownError.value =
        error instanceof Error ? error.message : 'Nao foi possivel carregar o markdown.'
    } finally {
      isMarkdownLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <aside
    class="card border-[var(--category-border)] bg-base-100/95 shadow-sm xl:sticky xl:top-4"
    :style="categoryStyle"
  >
    <template v-if="item">
      <div class="card-body gap-4 p-4">
        <div class="flex items-center justify-between gap-2">
          <CategoryBadge :category="item.category" />
          <span class="badge badge-outline badge-sm">{{ item.time }}</span>
        </div>

        <div class="space-y-1">
          <h2 class="text-lg font-bold text-base-content">{{ item.title }}</h2>
          <p class="text-sm leading-6 text-base-content/70">{{ item.summary }}</p>
        </div>

        <div v-if="item.markdown" class="space-y-2">
          <div v-if="isMarkdownLoading" class="alert alert-info py-2 text-sm shadow-none">
            <span>Carregando conteudo complementar...</span>
          </div>

          <div v-else-if="markdownError" class="alert alert-error py-2 text-sm shadow-none">
            <span>{{ markdownError }}</span>
          </div>

          <div
            v-else-if="markdownContent"
          >
            <MarkdownContent :content="markdownContent" class="rounded-box" />
          </div>
        </div>

        <div v-if="item.tags?.length" class="space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
            Tags
          </span>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in item.tags" :key="tag" class="badge badge-ghost badge-sm">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card-body place-content-center py-10 text-center">
        <h2 class="text-lg font-bold text-base-content">Selecione um item</h2>
        <p class="text-sm leading-6 text-base-content/70">
          Escolha um chip na timeline para ver os detalhes completos desta rotina.
        </p>
      </div>
    </template>
  </aside>
</template>
