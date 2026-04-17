export interface CategoryListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	is_active?: number
	is_option?: boolean | number
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
	is_active?: boolean
}

export interface CategoryListData {
	items: Category[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}

export interface CategoryFormState {
	id: number
	business_id: number | null
	name: string
	description: string | null
	is_active: boolean
}
export interface CategoryOption {
	id: number
	name: string
}
export type CategoryOptionListData = CategoryOption[]

