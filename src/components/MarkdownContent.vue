<script setup lang="ts">
import { ref, watch } from 'vue'

import { parseMarkdownToHtml } from '../lib/markdown'

const props = defineProps<{
  content: string
}>()

const html = ref('')

watch(
  () => props.content,
  async (value) => {
    html.value = await parseMarkdownToHtml(value)
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="html"
    class="markdown-body rounded-3xl border border-base-300 bg-base-100 p-4 text-sm leading-6 text-base-content/80"
    v-html="html"
  ></div>
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
