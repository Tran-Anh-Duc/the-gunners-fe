export interface CustomerListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	is_active?: boolean
	is_option?: boolean | number
	phone?: string
	email?:string
}
export interface Customer {
	id: number
	business_id: number
	name: string
	email: string
	address: string
	note: string | null
	phone: string | null
	created_at: string
	updated_at: string
	deleted_at: string | null
	is_active?: boolean
}
export interface CustomerFormRequest {
	name?: string
	phone?: string
	email?: string
	address?: string
	note?: string
	is_active?: boolean
}
export interface CustomerListData {
	items: Customer[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}

