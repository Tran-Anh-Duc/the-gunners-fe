export interface WarehouseListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	code?: string
	name?: string
	is_active?: number
}

export interface Warehouse {
	id: number
	business_id: number
	code: string
	name: string
	address: string | null
	created_at: string
	updated_at: string
	deleted_at: string | null
	is_active?: boolean
}

export interface WarehouseFormRequest {
	code?: string
	name?: string
	address?: string
	is_active?: boolean
}

export interface WarehouseListData {
	items: Warehouse[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}
export interface WarehouseFormState {
	id: number
	business_id: number | null
	name: string
	code: string
	address: string | null
	is_active: boolean
}
