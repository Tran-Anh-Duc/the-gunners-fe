import type { Warehouse } from '@/types/warehouse.ts'

export interface CategoryListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	is_active?: boolean
}
export interface Category {
	id: number
	business_id: number
	name: string
	description: string | null
	created_at: string
	updated_at: string
	deleted_at: string | null
	is_active?: boolean
}
export interface CategoryFormRequest {
	name?: string
	description?: string
	is_active?: string
}
export interface CategoryListData {
	items: Category[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}
