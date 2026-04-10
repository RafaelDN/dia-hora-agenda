<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { authState, initializeAuth, signOut } from './lib/auth'

const themeStorageKey = 'app-theme'
const availableThemes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
] as const

const route = useRoute()
const router = useRouter()

const isAuthenticated = computed(() => Boolean(authState.session))
const currentTheme = ref<(typeof availableThemes)[number]>('cupcake')

onMounted(() => {
  void initializeAuth()
  initializeTheme()
})

function navButtonClass(routeName: string) {
  return route.name === routeName ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'
}

function formatThemeLabel(theme: string) {
  return theme.charAt(0).toUpperCase() + theme.slice(1)
}

function applyTheme(theme: (typeof availableThemes)[number]) {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(themeStorageKey, theme)
}

function initializeTheme() {
  const savedTheme = window.localStorage.getItem(themeStorageKey)

  if (savedTheme && availableThemes.includes(savedTheme as (typeof availableThemes)[number])) {
    applyTheme(savedTheme as (typeof availableThemes)[number])
    return
  }

  applyTheme('cupcake')
}

function handleThemeChange(event: Event) {
  const nextTheme = (event.target as HTMLSelectElement).value as (typeof availableThemes)[number]
  applyTheme(nextTheme)
}

async function handleSignOut() {
  await signOut()

  if (route.meta.requiresAuth) {
    await router.replace({ name: 'home' })
  }
}
</script>

<template>
  <div class="min-h-screen">
    <header class="app-shell-header sticky top-0 z-30 border-b border-base-300/80 bg-base-100/75 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 p-3 lg:p-4">
        <div
          class="flex flex-col gap-3 rounded-[1.75rem] border border-base-300 bg-base-100/90 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div class="space-y-1">
            <RouterLink :to="{ name: 'home' }" class="text-lg font-semibold text-base-content">
              Rafael - Cronograma Nutricional
            </RouterLink>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label class="form-control min-w-40">
              <select
                class="select select-sm select-bordered"
                :value="currentTheme"
                @change="handleThemeChange"
              >
                <option v-for="theme in availableThemes" :key="theme" :value="theme">
                  {{ formatThemeLabel(theme) }}
                </option>
              </select>
            </label>

            <RouterLink :to="{ name: 'home' }" :class="navButtonClass('home')">
              Agenda
            </RouterLink>

            <RouterLink :to="{ name: 'profile' }" :class="navButtonClass('profile')">
              Perfil
            </RouterLink>

            <button
              v-if="isAuthenticated"
              class="btn btn-sm btn-outline"
              type="button"
              @click="handleSignOut"
            >
              Sair
            </button>

            <RouterLink
              v-else
              :to="{ name: 'login', query: { redirect: '/perfil' } }"
              :class="navButtonClass('login')"
            >
              Entrar
            </RouterLink>
          </div>
        </div>

        <div
          v-if="authState.loading"
          class="rounded-2xl border border-base-300 bg-base-100/80 px-4 py-2 text-xs text-base-content/60 shadow-sm"
        >
          Verificando sessao...
        </div>
      </div>
    </header>

    <RouterView />
  </div>
</template>
