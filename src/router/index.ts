import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import type { AppRoutes } from '@/types/router.ts'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import setupGuards from './guards.ts'
import UserListView from '@/views/admin/users/UserListView.vue'
import UnitListView from '@/views/admin/units/UnitListView.vue'
import WarehouseListView from '@/views/admin/Warehouses/WarehouseListView.vue'

const routes: AppRoutes = [
  {
    path: '/login',
    component: AuthLayout,
    meta: {
      guestOnly: true,
      title: 'Login',
    },
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView,
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      title: 'Admin',
    },
    children: [
      {
        path: '',
        name: 'admin.dashboard',
        component: DashboardView,
        meta: {
          title: 'Dashboard',
        },
      },
      {
        path: 'users',
        name: 'admin.users',
        component: UserListView,
        meta: {
          title: 'Users',
        },
      },
      {
        path: 'units',
        name: 'admin.units',
        component: UnitListView,
        meta: {
          title: 'Units',
        },
      },
      {
        path: 'warehouses',
        name: 'admin.warehouses',
        component: WarehouseListView,
        meta: {
          title: 'Warehouses',
        },
      },
    ],
  },
  {
    path: '/',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

export default router
