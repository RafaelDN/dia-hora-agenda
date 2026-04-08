<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { authState, signInWithPassword } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const formError = ref('')
const isSubmitting = ref(false)

const redirectTarget = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value.startsWith('/') ? value : '/perfil'
})

const canSubmit = computed(
  () =>
    isSupabaseConfigured() &&
    !isSubmitting.value &&
    !authState.loading &&
    email.value.trim() !== '' &&
    password.value.trim() !== '',
)

async function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    await signInWithPassword(email.value.trim(), password.value)
    await router.replace(redirectTarget.value)
  } catch (error) {
    formError.value =
      error instanceof Error ? error.message : 'Nao foi possivel entrar agora.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex w-full max-w-7xl flex-1 items-start justify-center p-3 lg:p-4">
    <section class="grid w-full max-w-5xl gap-3 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
      <div class="card border border-base-300 bg-base-100/90 shadow-sm">
        <div class="card-body gap-4 p-5">
          <div v-if="formError" class="alert alert-error shadow-sm">
            <span>{{ formError }}</span>
          </div>

          <form class="grid gap-3" @submit.prevent="handleSubmit">
            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">Email</span>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                class="input input-bordered w-full"
                placeholder="voce@exemplo.com"
              />
            </label>

            <label class="form-control w-full gap-2">
              <span class="label-text font-medium">Senha</span>
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                class="input input-bordered w-full"
                placeholder="********"
              />
            </label>

            <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
              <button class="btn btn-primary sm:min-w-36" :disabled="!canSubmit">
                {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>
