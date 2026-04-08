<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'

import CategoryBadge from './CategoryBadge.vue'
import { getCategoryStyle } from '../data/categories'
import { loadMarkdownDocument } from '../data/loadMarkdown'
import type { RoutineItem } from '../types/routine'

const props = defineProps<{
  item: RoutineItem | null
}>()

const categoryStyle = computed(() =>
  props.item ? getCategoryStyle(props.item.category) : undefined,
)

const markdownHtml = ref('')
const markdownError = ref('')
const isMarkdownLoading = ref(false)

watch(
  () => props.item?.markdown,
  async (markdownFile) => {
    markdownHtml.value = ''
    markdownError.value = ''

    if (!markdownFile) {
      return
    }

    isMarkdownLoading.value = true

    try {
      const markdownContent = await loadMarkdownDocument(markdownFile)
      markdownHtml.value = await marked.parse(markdownContent)
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
            v-else-if="markdownHtml"
            class="markdown-body rounded-box border border-base-300 bg-base-100 p-4 text-sm leading-6 text-base-content/80"
            v-html="markdownHtml"
          ></div>
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

<style scoped>
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin: 0 0 0.5rem;
  color: oklch(var(--bc));
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.markdown-body :deep(h1) {
  font-size: 1.25rem;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
}

.markdown-body :deep(h2) {
  font-size: 1.05rem;
  margin-top: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid oklch(var(--b3));
}

.markdown-body :deep(h3) {
  font-size: 0.95rem;
  margin-top: 0.85rem;
}

.markdown-body :deep(p) {
  margin: 0 0 0.8rem;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 0.8rem;
  padding-left: 1.35rem;
}

.markdown-body :deep(ul) {
  list-style: disc;
}

.markdown-body :deep(ol) {
  list-style: decimal;
}

.markdown-body :deep(li) {
  margin: 0.2rem 0;
  padding-left: 0.1rem;
}

.markdown-body :deep(li)::marker {
  color: oklch(var(--bc) / 0.7);
}

.markdown-body :deep(strong) {
  color: oklch(var(--bc));
}

.markdown-body :deep(code) {
  border-radius: 0.4rem;
  background: oklch(var(--b2));
  padding: 0.1rem 0.35rem;
  font-size: 0.85em;
}
</style>
