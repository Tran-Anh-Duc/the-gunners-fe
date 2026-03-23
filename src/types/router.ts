import type { RouteRecordRaw } from 'vue-router'

export interface AppRouteMeta {
  requiresAuth?: boolean
  guestOnly?: boolean
  title?: string
}

export type AppRoute = RouteRecordRaw & {
  meta?: AppRouteMeta
}

export type AppRoutes = AppRoute[]
