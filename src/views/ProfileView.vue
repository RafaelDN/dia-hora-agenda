<script setup lang="ts">
import { computed, ref } from 'vue'

import ProfileFilesTab from '../components/profile/ProfileFilesTab.vue'
import ProfileJournalTab from '../components/profile/ProfileJournalTab.vue'
import { authState } from '../lib/auth'

type ProfileTabId = 'journal' | 'files'

const activeTab = ref<ProfileTabId>('journal')
const currentUserId = computed(() => authState.user?.id ?? '')

</script>

<template>
  <main class="mx-auto flex w-full max-w-7xl flex-1 p-3 lg:p-4">
    <section class="w-full space-y-3">
      <div class="rounded-[1.75rem] border border-base-300 bg-base-100/80 p-2 shadow-sm">
        <div class="flex gap-2">
          <button
            class="btn h-12 flex-1 rounded-[1.1rem] text-sm font-medium"
            :class="activeTab === 'journal' ? 'btn-primary' : 'btn-ghost'"
            type="button"
            @click="activeTab = 'journal'"
          >
            Diario
          </button>

          <button
            class="btn h-12 flex-1 rounded-[1.1rem] text-sm font-medium"
            :class="activeTab === 'files' ? 'btn-primary' : 'btn-ghost'"
            type="button"
            @click="activeTab = 'files'"
          >
            Anexos
          </button>
        </div>
      </div>

      <ProfileJournalTab v-if="activeTab === 'journal'" :user-id="currentUserId" />
      <ProfileFilesTab v-else :user-id="currentUserId" />
    </section>
  </main>
</template>
