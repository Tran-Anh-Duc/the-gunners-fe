export interface SupplierListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	contact_name?: string
	phone?: string
	email?: string
	is_active?: boolean
	is_option?: boolean | number
}
export interface Supplier {
	id: number
	business_id: number
	name: string
	contact_name: string | null
	phone: string | null
	email: string | null
	address: string | null
	note: string | null
	created_at: string
	updated_at: string
	deleted_at: string | null
	is_active?: boolean
}
export interface SupplierFormRequest {
	name?: string
	description?: string
	contact_name?: string
	phone?: string
	email?: string
	address?: string
	note?: string
	is_active?: boolean
}
export interface SupplierListData {
	items: Supplier[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}

