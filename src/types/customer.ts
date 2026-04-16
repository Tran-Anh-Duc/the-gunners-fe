export interface CustomerListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	name?: string
	is_active?: number
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
export interface CustomerFormState {
	id: number
	business_id: number | null
	name: string
	description: string | null
	phone: string | null
	email: string | null
	address: string | null
	note: string | null
	is_active: boolean
}

