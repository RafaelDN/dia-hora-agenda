<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import MarkdownContent from '../MarkdownContent.vue'
import { loadMarkdownDocument } from '../../data/loadMarkdown'

type DoctorProfile = {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  website: string
  markdown: string
}

const doctors: DoctorProfile[] = [
  {
    id: 'dra-marina-alves',
    name: 'Dra. Marina Alves',
    specialty: 'Clinica geral integrativa',
    email: 'marina.alves@exemplo.com',
    phone: '(11) 99999-1200',
    website: 'https://marina-alves.exemplo.com',
    markdown: 'doctors/dra-marina-alves.md',
  },
  {
    id: 'dr-lucas-ferreira',
    name: 'Dr. Lucas Ferreira',
    specialty: 'Cardiologia preventiva',
    email: 'lucas.ferreira@exemplo.com',
    phone: '(11) 98888-4300',
    website: 'https://lucas-ferreira.exemplo.com',
    markdown: 'doctors/dr-lucas-ferreira.md',
  },
]

const selectedDoctorId = ref(doctors[0]?.id ?? '')
const doctorMarkdown = ref('')
const isMarkdownLoading = ref(false)
const markdownError = ref('')

const selectedDoctor = computed(
  () => doctors.find((doctor) => doctor.id === selectedDoctorId.value) ?? null,
)

watch(
  selectedDoctor,
  async (doctor) => {
    doctorMarkdown.value = ''
    markdownError.value = ''

    if (!doctor) {
      return
    }

    isMarkdownLoading.value = true

    try {
      doctorMarkdown.value = await loadMarkdownDocument(doctor.markdown)
    } catch (error) {
      markdownError.value =
        error instanceof Error ? error.message : 'Nao foi possivel carregar o perfil do medico.'
    } finally {
      isMarkdownLoading.value = false
    }
  },
  { immediate: true },
)

function normalizeLinkLabel(value: string) {
  return value.replace(/^https?:\/\//, '')
}
</script>

<template>
  <div class="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
    <section class="space-y-3">
      <div class="card border border-base-300 bg-base-100/90 shadow-sm">
        <div class="card-body gap-4 p-5">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
              Medicos
            </span>
            <h2 class="text-xl font-semibold text-base-content">Contatos de acompanhamento</h2>
          </div>

          <p class="text-sm leading-6 text-base-content/60">
            Lista fixa de profissionais com contato rapido e um markdown dedicado para anotacoes.
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <button
          v-for="doctor in doctors"
          :key="doctor.id"
          class="card w-full border text-left shadow-sm transition"
          :class="
            selectedDoctorId === doctor.id
              ? 'border-primary bg-primary/5'
              : 'border-base-300 bg-base-100/85 hover:border-base-content/25'
          "
          type="button"
          @click="selectedDoctorId = doctor.id"
        >
          <div class="card-body gap-2 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-base-content">{{ doctor.name }}</h3>
                <p class="text-sm text-base-content/60">{{ doctor.specialty }}</p>
              </div>

              <span
                class="badge"
                :class="selectedDoctorId === doctor.id ? 'badge-primary' : 'badge-ghost'"
              >
                Perfil
              </span>
            </div>

            <div class="space-y-1 text-sm text-base-content/65">
              <p>{{ doctor.phone }}</p>
              <p>{{ doctor.email }}</p>
            </div>
          </div>
        </button>
      </div>
    </section>

    <aside class="card border border-base-300 bg-base-100/95 shadow-sm xl:sticky xl:top-4">
      <template v-if="selectedDoctor">
        <div class="card-body gap-5 p-5">
          <div class="space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/55">
              Perfil do medico
            </span>
            <div class="space-y-1">
              <h2 class="text-2xl font-semibold text-base-content">{{ selectedDoctor.name }}</h2>
              <p class="text-sm leading-6 text-base-content/60">{{ selectedDoctor.specialty }}</p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <a
              class="rounded-3xl border border-base-300 bg-base-200/35 p-4 transition hover:border-base-content/25"
              :href="`mailto:${selectedDoctor.email}`"
            >
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/50">
                Email
              </span>
              <p class="mt-2 font-medium text-base-content">{{ selectedDoctor.email }}</p>
            </a>

            <a
              class="rounded-3xl border border-base-300 bg-base-200/35 p-4 transition hover:border-base-content/25"
              :href="`tel:${selectedDoctor.phone.replace(/[^+\d]/g, '')}`"
            >
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/50">
                Telefone
              </span>
              <p class="mt-2 font-medium text-base-content">{{ selectedDoctor.phone }}</p>
            </a>

            <a
              class="rounded-3xl border border-base-300 bg-base-200/35 p-4 transition hover:border-base-content/25 md:col-span-2"
              :href="selectedDoctor.website"
              target="_blank"
              rel="noreferrer"
            >
              <span class="text-[11px] font-bold uppercase tracking-[0.12em] text-base-content/50">
                Site
              </span>
              <p class="mt-2 font-medium text-base-content">
                {{ normalizeLinkLabel(selectedDoctor.website) }}
              </p>
            </a>
          </div>

          <div v-if="isMarkdownLoading" class="alert alert-info py-2 text-sm shadow-none">
            <span>Carregando anotacoes complementares...</span>
          </div>

          <div v-else-if="markdownError" class="alert alert-error py-2 text-sm shadow-none">
            <span>{{ markdownError }}</span>
          </div>

          <MarkdownContent v-else-if="doctorMarkdown" :content="doctorMarkdown" />
        </div>
      </template>

      <template v-else>
        <div class="card-body place-content-center py-10 text-center">
          <h2 class="text-lg font-bold text-base-content">Selecione um medico</h2>
          <p class="text-sm leading-6 text-base-content/70">
            Escolha um contato para abrir os dados e o markdown complementar.
          </p>
        </div>
      </template>
    </aside>
  </div>
</template>
