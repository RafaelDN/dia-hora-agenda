import type { Session, User } from '@supabase/supabase-js'
import { reactive, readonly } from 'vue'

import {
  getSupabaseClient,
  isSupabaseConfigured,
  supabaseConfigError,
} from './supabase'

type AuthState = {
  initialized: boolean
  loading: boolean
  session: Session | null
  user: User | null
  errorMessage: string
}

const state = reactive<AuthState>({
  initialized: false,
  loading: true,
  session: null,
  user: null,
  errorMessage: '',
})

let initializePromise: Promise<void> | null = null
let isAuthListenerRegistered = false

function applySession(session: Session | null) {
  state.session = session
  state.user = session?.user ?? null
}

function registerAuthListener() {
  if (isAuthListenerRegistered || !isSupabaseConfigured()) {
    return
  }

  getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    state.errorMessage = ''
    applySession(session)
  })

  isAuthListenerRegistered = true
}

export const authState = readonly(state)

export async function initializeAuth() {
  if (state.initialized) {
    return
  }

  if (initializePromise) {
    return initializePromise
  }

  initializePromise = (async () => {
    state.loading = true

    if (!isSupabaseConfigured()) {
      state.errorMessage = supabaseConfigError
      applySession(null)
      return
    }

    const { data, error } = await getSupabaseClient().auth.getSession()

    if (error) {
      state.errorMessage = error.message
      applySession(null)
      return
    }

    state.errorMessage = ''
    applySession(data.session)
    registerAuthListener()
  })().finally(() => {
    state.initialized = true
    state.loading = false
    initializePromise = null
  })

  return initializePromise
}

export async function signInWithPassword(email: string, password: string) {
  await initializeAuth()

  if (!isSupabaseConfigured()) {
    throw new Error(supabaseConfigError)
  }

  state.loading = true

  try {
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    state.errorMessage = ''
    applySession(data.session)
    registerAuthListener()
  } finally {
    state.loading = false
  }
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    applySession(null)
    return
  }

  state.loading = true

  try {
    const { error } = await getSupabaseClient().auth.signOut()

    if (error) {
      throw error
    }

    applySession(null)
  } finally {
    state.loading = false
  }
}
