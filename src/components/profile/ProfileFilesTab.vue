<script setup lang="ts">
import { ref, watch } from 'vue'

import {
  deleteProfileFile,
  listProfileFiles,
  uploadProfileFile,
  createProfileFileSignedUrl,
} from '../../lib/profileFiles'
import {
  readCachedProfileFiles,
  writeCachedProfileFiles,
} from '../../lib/profileCache'
import type { UserFileRecord } from '../../types/userFile'

type FileListItem = UserFileRecord & {
  isOpening?: boolean
}

const props = defineProps<{
  userId: string
}>()

const files = ref<FileListItem[]>([])
const isFilesLoading = ref(false)
const filesError = ref('')
const isUploading = ref(false)
const deletingFileId = ref('')
const uploadError = ref('')
const uploadSuccess = ref('')
const selectedFile = ref<File | null>(null)
const fileName = ref('')
const description = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.userId,
  (userId) => {
    if (!userId) {
      files.value = []
      filesError.value = ''
      return
    }

    void loadFiles(userId)
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

async function loadFiles(userId: string) {
  const cachedFiles = readCachedProfileFiles(userId)

  if (cachedFiles) {
    files.value = cachedFiles.records.map((file) => ({ ...file }))
    return
  }

  await syncFilesFromServer(userId)
}

async function syncFilesFromServer(userId: string) {
  isFilesLoading.value = true
  filesError.value = ''

  try {
    const records = await listProfileFiles(userId)
    writeCachedProfileFiles(userId, records)
    files.value = records.map((file) => ({ ...file }))
  } catch (error) {
    filesError.value =
      error instanceof Error ? error.message : 'Nao foi possivel carregar os anexos.'
  } finally {
    isFilesLoading.value = false
  }
}

async function handleOpen(file: FileListItem) {
  const target = files.value.find((item) => item.id === file.id)

  if (target) {
    target.isOpening = true
  }

  try {
    const signedUrl = await createProfileFileSignedUrl(file.file_path)
    window.open(signedUrl, '_blank', 'noopener,noreferrer')
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : 'Nao foi possivel abrir o arquivo.'
  } finally {
    if (target) {
      target.isOpening = false
    }
  }
}

function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement
  const [file] = input.files ?? []

  selectedFile.value = file ?? null
  uploadError.value = ''
  uploadSuccess.value = ''

  if (file && fileName.value.trim() === '') {
    fileName.value = file.name
  }
}

async function handleUpload() {
  if (!props.userId) {
    uploadError.value = 'Sessao invalida. Entre novamente.'
    return
  }

  if (!selectedFile.value) {
    uploadError.value = 'Selecione um arquivo antes de enviar.'
    return
  }

  if (fileName.value.trim() === '') {
    uploadError.value = 'Informe um nome para o anexo.'
    return
  }

  isUploading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''

  try {
    await uploadProfileFile({
      userId: props.userId,
      file: selectedFile.value,
      name: fileName.value.trim(),
      description: description.value,
    })

    await syncFilesFromServer(props.userId)

    selectedFile.value = null
    fileName.value = ''
    description.value = ''
    uploadSuccess.value = 'Arquivo enviado com sucesso.'

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : 'Nao foi possivel enviar o arquivo.'
  } finally {
    isUploading.value = false
  }
}

async function handleDelete(file: FileListItem) {
  if (!props.userId) {
    uploadError.value = 'Sessao invalida. Entre novamente.'
    return
  }

  const confirmed = window.confirm(`Remover o anexo "${file.name}"?`)

  if (!confirmed) {
    return
  }

  deletingFileId.value = file.id
  uploadError.value = ''
  uploadSuccess.value = ''

  try {
    await deleteProfileFile(file.id, file.file_path)
    await syncFilesFromServer(props.userId)
    uploadSuccess.value = 'Arquivo removido com sucesso.'
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : 'Nao foi possivel remover o arquivo.'
  } finally {
    deletingFileId.value = ''
  }
}
</script>

<template>
  <div class="card border border-base-300 bg-base-100/90 shadow-sm">
    <div class="card-body gap-4 p-5">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
            Arquivos anexos
          </span>
          <h2 class="text-xl font-semibold text-base-content">Upload e histórico</h2>
        </div>

        <div class="text-sm text-base-content/60">
          {{ files.length }} arquivo(s)
        </div>
      </div>

      <div class="space-y-3">
        <div v-if="isFilesLoading" class="alert alert-info shadow-sm">
          <span>Carregando anexos do perfil...</span>
        </div>

        <div v-else-if="filesError" class="alert alert-error shadow-sm">
          <span>{{ filesError }}</span>
        </div>

        <div
          v-else-if="files.length === 0"
          class="rounded-3xl border border-dashed border-base-300 bg-base-200/20 p-6 text-sm leading-6 text-base-content/60"
        >
          Nenhum arquivo anexado ainda.
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="file in files"
            :key="file.id"
            class="rounded-3xl border border-base-300 bg-base-100 px-4 py-4 shadow-sm"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="link link-primary text-left text-base font-semibold"
                    :disabled="file.isOpening"
                    @click="handleOpen(file)"
                  >
                    {{ file.isOpening ? 'Abrindo...' : file.name }}
                  </button>
                </div>

                <p v-if="file.description" class="text-sm leading-6 text-base-content/70">
                  {{ file.description }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <div class="text-sm text-base-content/55">
                  {{ formatDate(file.created_at) || 'Data indisponivel' }}
                </div>

                <button
                  class="btn btn-sm btn-outline btn-error"
                  type="button"
                  :disabled="deletingFileId === file.id"
                  @click="handleDelete(file)"
                >
                  {{ deletingFileId === file.id ? 'Removendo...' : 'Remover' }}
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="uploadError" class="alert alert-error shadow-sm">
        <span>{{ uploadError }}</span>
      </div>

      <div v-else-if="uploadSuccess" class="alert alert-success shadow-sm">
        <span>{{ uploadSuccess }}</span>
      </div>

      <form
        class="grid gap-3 rounded-3xl border border-base-300 bg-base-200/35 p-4"
        @submit.prevent="handleUpload"
      >
        <label class="form-control w-full gap-2">
          <span class="label-text font-medium">Arquivo</span>
          <input
            ref="fileInput"
            type="file"
            class="file-input file-input-bordered w-full"
            @change="handleFileSelection"
          />
        </label>

        <label class="form-control w-full gap-2">
          <span class="label-text font-medium">Nome do anexo</span>
          <input
            v-model="fileName"
            type="text"
            class="input input-bordered w-full"
            placeholder="Ex.: Exame de sangue"
          />
        </label>

        <label class="form-control w-full gap-2">
          <span class="label-text font-medium">Descricao</span>
          <textarea
            v-model="description"
            class="textarea textarea-bordered min-h-28 w-full"
            placeholder="Observacoes opcionais sobre o arquivo"
          />
        </label>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm leading-6 text-base-content/60">
            O arquivo vai para o bucket privado do perfil e a lista abaixo respeita
            <code>created_at desc</code>.
          </p>

          <button class="btn btn-primary sm:min-w-36" type="submit" :disabled="isUploading">
            {{ isUploading ? 'Enviando...' : 'Enviar arquivo' }}
          </button>
        </div>
      </form>
      
      </div>
    </div>
  </div>
</template>
