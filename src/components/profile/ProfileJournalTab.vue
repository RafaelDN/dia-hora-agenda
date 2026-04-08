<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { marked } from 'marked'

import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  updateJournalEntry,
} from '../../lib/journalEntries'
import type { JournalEntry } from '../../types/journalEntry'

const props = defineProps<{
  userId: string
}>()

const entries = ref<JournalEntry[]>([])
const isEntriesLoading = ref(false)
const entriesError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const isSaving = ref(false)
const deletingEntryId = ref('')
const editingEntryId = ref('')
const title = ref('')
const tagsInput = ref('')
const contentMd = ref('')
const previewHtml = ref('')
const currentPage = ref(1)
const pageSize = 10
const editorCard = ref<HTMLElement | null>(null)

const isEditing = computed(() => editingEntryId.value !== '')
const totalPages = computed(() => Math.max(1, Math.ceil(entries.value.length / pageSize)))
const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return entries.value.slice(start, start + pageSize)
})

watch(
  () => props.userId,
  (userId) => {
    if (!userId) {
      entries.value = []
      entriesError.value = ''
      resetForm()
      return
    }

    void loadEntries(userId)
  },
  { immediate: true },
)

watch(
  contentMd,
  async (value) => {
    previewHtml.value = value.trim() === '' ? '' : await marked.parse(value)
  },
  { immediate: true },
)

function formatDate(value: string | null) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function renderMarkdown(value: string) {
  return marked.parse(value) as string
}

function normalizeTagsInput(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '')
}

function resetForm() {
  editingEntryId.value = ''
  title.value = ''
  tagsInput.value = ''
  contentMd.value = ''
  saveError.value = ''
}

function handleNewEntry() {
  resetForm()
  saveSuccess.value = ''
}

async function loadEntries(userId: string) {
  isEntriesLoading.value = true
  entriesError.value = ''

  try {
    entries.value = await listJournalEntries(userId)
    currentPage.value = 1
  } catch (error) {
    entriesError.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar o diario.'
  } finally {
    isEntriesLoading.value = false
  }
}

function handleEdit(entry: JournalEntry) {
  editingEntryId.value = entry.id
  title.value = entry.title
  tagsInput.value = entry.tags?.join(', ') ?? ''
  contentMd.value = entry.content_md
  saveError.value = ''
  saveSuccess.value = ''

  void nextTick(() => {
    editorCard.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

async function handleDelete(entry: JournalEntry) {
  if (!props.userId) {
    saveError.value = 'Sessao invalida. Entre novamente.'
    return
  }

  const confirmed = window.confirm(`Remover a entrada "${entry.title}"?`)

  if (!confirmed) {
    return
  }

  deletingEntryId.value = entry.id
  saveError.value = ''
  saveSuccess.value = ''

  try {
    await deleteJournalEntry(entry.id)

    if (editingEntryId.value === entry.id) {
      resetForm()
    }

    await loadEntries(props.userId)
    saveSuccess.value = 'Entrada removida com sucesso.'
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : 'Nao foi possivel remover a entrada.'
  } finally {
    deletingEntryId.value = ''
  }
}

async function handleSubmit() {
  if (!props.userId) {
    saveError.value = 'Sessao invalida. Entre novamente.'
    return
  }

  if (title.value.trim() === '') {
    saveError.value = 'Informe um titulo.'
    return
  }

  if (contentMd.value.trim() === '') {
    saveError.value = 'Escreva o conteudo em markdown.'
    return
  }

  isSaving.value = true
  saveError.value = ''
  saveSuccess.value = ''

  const payload = {
    title: title.value.trim(),
    contentMd: contentMd.value,
    tags: normalizeTagsInput(tagsInput.value),
  }

  try {
    if (isEditing.value) {
      await updateJournalEntry(editingEntryId.value, payload)
      saveSuccess.value = 'Entrada atualizada com sucesso.'
    } else {
      await createJournalEntry(props.userId, payload)
      saveSuccess.value = 'Entrada criada com sucesso.'
    }

    await loadEntries(props.userId)
    resetForm()
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : 'Nao foi possivel salvar a entrada.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-3">
    <div ref="editorCard" class="card border border-base-300 bg-base-100/90 shadow-sm">
      <div class="card-body gap-4 p-5">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
              Diario
            </span>
          </div>
        </div>

        <div class="text-sm text-base-content/60">
          {{ entries.length }} entrada(s)
        </div>
      </div>
    </div>

    <div v-if="isEntriesLoading" class="alert alert-info shadow-sm">
      <span>Carregando entradas do diario...</span>
    </div>

    <div v-else-if="entriesError" class="alert alert-error shadow-sm">
      <span>{{ entriesError }}</span>
    </div>

    <div
      v-else-if="entries.length === 0"
      class="rounded-3xl border border-dashed border-base-300 bg-base-200/20 p-6 text-sm leading-6 text-base-content/60"
    >
      Nenhuma entrada criada ainda.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="entry in paginatedEntries"
        :key="entry.id"
        class="card border border-base-300 bg-base-100/90 shadow-sm"
      >
        <article class="card-body gap-4 p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="space-y-1">
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
                {{ formatDate(entry.created_at) || 'Data indisponivel' }}
              </span>
              <h3 class="text-xl font-semibold text-base-content">{{ entry.title }}</h3>
            </div>

            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-outline" type="button" @click="handleEdit(entry)">
                Editar
              </button>
              <button
                class="btn btn-sm btn-outline btn-error"
                type="button"
                :disabled="deletingEntryId === entry.id"
                @click="handleDelete(entry)"
              >
                {{ deletingEntryId === entry.id ? 'Removendo...' : 'Remover' }}
              </button>
            </div>
          </div>

          <div v-if="entry.tags?.length" class="flex flex-wrap gap-1.5">
            <span v-for="tag in entry.tags" :key="tag" class="badge badge-ghost badge-sm">
              {{ tag }}
            </span>
          </div>

          <div
            class="markdown-body rounded-3xl border border-base-300 bg-base-100 p-4 text-sm leading-6 text-base-content/80"
            v-html="renderMarkdown(entry.content_md)"
          ></div>
        </article>
      </li>
    </ul>

    <div
      v-if="entries.length > pageSize"
      class="flex flex-col gap-2 rounded-3xl border border-base-300 bg-base-100/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-base-content/60">
        Pagina {{ currentPage }} de {{ totalPages }}
      </p>

      <div class="join">
        <button
          class="join-item btn btn-sm"
          type="button"
          :disabled="currentPage === 1"
          @click="currentPage -= 1"
        >
          Anterior
        </button>
        <button
          class="join-item btn btn-sm"
          type="button"
          :disabled="currentPage === totalPages"
          @click="currentPage += 1"
        >
          Proxima
        </button>
      </div>
    </div>

    <div class="card border border-base-300 bg-base-100/90 shadow-sm">
      <div class="card-body gap-4 p-5">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
              Editor
            </span>
            <h3 class="text-xl font-semibold text-base-content">
              {{ isEditing ? 'Editar entrada' : 'Nova entrada' }}
            </h3>
          </div>

          <button class="btn btn-sm btn-ghost" type="button" @click="handleNewEntry">
            Limpar formulario
          </button>
        </div>

        <div v-if="saveError" class="alert alert-error shadow-sm">
          <span>{{ saveError }}</span>
        </div>

        <div v-else-if="saveSuccess" class="alert alert-success shadow-sm">
          <span>{{ saveSuccess }}</span>
        </div>

        <form
          class="grid gap-3 rounded-3xl border border-base-300 bg-base-200/35 p-4"
          @submit.prevent="handleSubmit"
        >
          <label class="form-control w-full gap-2">
            <span class="label-text font-medium">Titulo</span>
            <input
              v-model="title"
              type="text"
              class="input input-bordered w-full"
              placeholder="Ex.: Reflexoes sobre a semana"
            />
          </label>

          <label class="form-control w-full gap-2">
            <span class="label-text font-medium">Tags</span>
            <input
              v-model="tagsInput"
              type="text"
              class="input input-bordered w-full"
              placeholder="saude, rotina, observacoes"
            />
          </label>

          <label class="form-control w-full gap-2">
            <span class="label-text font-medium">Conteudo em Markdown</span>
            <textarea
              v-model="contentMd"
              class="textarea textarea-bordered min-h-72 w-full font-mono text-sm"
            />
          </label>

          <div
            v-if="previewHtml"
            class="markdown-body rounded-3xl border border-base-300 bg-base-100 p-4 text-sm leading-6 text-base-content/80"
            v-html="previewHtml"
          ></div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm leading-6 text-base-content/60">
              
            </p>

            <button class="btn btn-primary sm:min-w-36" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Publicar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
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
