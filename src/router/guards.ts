import type {NavigationGuardNext, RouteLocationNormalized, RouteLocationNormalizedLoaded, Router} from 'vue-router'

export default function setupGuards(router: Router) {
  router.beforeEach((to:RouteLocationNormalized, from: RouteLocationNormalizedLoaded, next: NavigationGuardNext) => {
    const token = localStorage.getItem('token')

    // set title
    if (to.meta.title) {
      document.title = String(to.meta.title)
    }

    // chưa login mà vào admin
    if (to.meta.requiresAuth && !token) {
      next('/login')
      return
    }

    // đã login mà vào login
    if (to.meta.guestOnly && token) {
      next('/admin')
      return
    }

    next()
  })
}