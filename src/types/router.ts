import type { RouteRecordRaw } from 'vue-router'

export interface AppRouteMeta {
  requiresAuth?: boolean
  guestOnly?: boolean
  title?: string
}

export interface AppRoute extends RouteRecordRaw {
  meta?: AppRouteMeta
}