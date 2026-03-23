import type { Router } from 'vue-router'

export default function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const token = localStorage.getItem('token')
    const tokenExpiredAt = localStorage.getItem('token_expired_at')
    if (to.meta.title) {
      document.title = String(to.meta.title)
    }

    const isAuthenticated =
      !!token &&
      !!tokenExpiredAt &&
      Date.now() < Number(tokenExpiredAt)

    if (token && tokenExpiredAt && Date.now() >= Number(tokenExpiredAt)) {
      localStorage.removeItem('token')
      localStorage.removeItem('token_expired_at')
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
      return '/login'
    }

    if (to.meta.guestOnly && isAuthenticated) {
      return '/admin'
    }
  })
}