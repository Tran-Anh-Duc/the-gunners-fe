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
import CategoryListView from '@/views/admin/Categories/CategoryListView.vue'
import ProductListView from '@/views/admin/Products/ProductListView.vue'
import CustomerListView from '@/views/admin/Customers/CustomerListView.vue'
import SupplierListView from '@/views/admin/Suppliers/SupplierListView.vue'

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
			{
				path: 'categories',
				name: 'admin.categories',
				component: CategoryListView,
				meta: {
					title: 'Categories',
				},
			},
			{
				path: 'products',
				name: 'admin.products',
				component: ProductListView,
				meta: {
					title: 'Products',
				},
			},
			{
				path: 'customers',
				name: 'admin.customers',
				component: CustomerListView,
				meta: {
					title: 'Customers',
				},
			},
			{
				path: 'suppliers',
				name: 'admin.suppliers',
				component: SupplierListView,
				meta: {
					title: 'Suppliers',
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
