
export interface WarehouseDocumentListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	document_code?: string
	document_type?: 'import' | 'export' | null
	warehouse_id?: number
	document_date_from?: string
	document_date_to?: string
	status?: string
	is_option?: boolean | number
}

export interface WarehouseBasic {
	id: number
	code: string
	name: string
}

export interface UserBasic {
	id: number
	name: string
	email: string
}

export interface ProductBasic {
	id: number
	sku: string
	name: string
}

export interface UnitBasic {
	id: number
	code: string
	name: string
}

export interface WarehouseDocumentDetail {
	id: number
	warehouse_document_id: number
	product_id: number
	product_name: string
	unit_id: number
	unit_name: string
	quantity: string
	unit_price: string
	subtotal: string
	tax_rate: string
	tax_price: string
	total_price: string
	note: string | null
	product: ProductBasic
	unit: UnitBasic
	created_at: string
	updated_at: string
}

export interface WarehouseDocument {
	id: number
	business_id: number
	document_code: string
	document_type: 'import' | 'export' | string
	document_date: string
	status: string
	reference_code: string | null
	subtotal_amount: string
	tax_amount: string
	total_amount: string
	note: string | null
	warehouse: WarehouseBasic
	creator: UserBasic
	updater: UserBasic | null
	approver: UserBasic | null
	approved_at: string | null
	details: WarehouseDocumentDetail[]
	created_at: string
	updated_at: string
	deleted_at: string | null
}

export interface WarehouseDocumentListData {
	items: WarehouseDocument[]
	current_page?: number
	per_page?: number
	total?: number
	last_page?: number
}

export interface WarehouseDocumentFormDetail {
	product_id: number | null
	product_name: string
	unit_id: number | null
	unit_name: string
	quantity: number
	unit_price: number
	subtotal: number
	tax_rate: number
	tax_price: number
	total_price: number
	note: string | null
	product_options: any[]
	product_loading: boolean
}

export interface WarehouseDocumentFormRequest {
	business_id: number | null
	document_code: string
	document_type: 'import' | 'export' | ''
	warehouse_id: number | null
	document_date: string
	status: 'draft' | 'confirmed' | 'cancelled' | ''
	reference_code: string | null
	note: string | null
	approved_by: number | null
	approved_at: string | null

	warehouse_name: string | null
	creator_name: string | null
	approver_name: string | null
	updater_name: string | null
	created_at: string | null
	updated_at: string | null
	subtotal_amount: number
	tax_amount: number
	total_amount: number

	details: WarehouseDocumentFormDetail[]
}
export interface WarehouseDocumentSearchForm {
	document_code: string
	document_type: 'import' | 'export' | null
}


