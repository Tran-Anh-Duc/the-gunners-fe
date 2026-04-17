import type { Unit } from '@/types/unit.ts'
import type { Category } from '@/types/category.ts'

export interface ProductListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	is_active?: number
	category_id?: number
	unit_id?: number
	is_option?: boolean | number
}

export interface Product {
	id: number
	business_id: number
	unit_id: number
	category_id: number
	is_active?: boolean
	sku?: string | null
	name: string
	barcode?: string | null
	product_type?: string
	track_inventory?: boolean
	cost_price?: number | null
	sale_price?: number | null
	description?: string
	name_slug?: string
	created_at: string
	updated_at: string
	deleted_at: string | null
	unit?: Unit
	category?: Category
}

export interface ProductFormRequest {
	unit_id?: number
	category_id?: number
	name?: string
	sku?: string
	description?: string
	is_active?: boolean
}
export interface ProductListData {
	items: Product[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}
export interface ProductFormState {
	id: number
	business_id: number | null
	name: string | null
	description: string | null
	is_active: boolean
	sku: string | null
	unit_id: number | null
	category_id: number | null
	category_name: string | null
	unit_name: string | null
}

