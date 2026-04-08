import { createRouter, createWebHashHistory } from 'vue-router'

import { authState, initializeAuth } from '../lib/auth'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import RoutineView from '../views/RoutineView.vue'

function normalizeRedirect(value: unknown) {
  if (typeof value === 'string' && value.startsWith('/')) {
    return value
  }

  return '/perfil'
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: RoutineView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/perfil',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  await initializeAuth()

  if (to.meta.requiresAuth && !authState.session) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.name === 'login' && authState.session) {
    return normalizeRedirect(to.query.redirect)
  }

  return true
})

export default router
