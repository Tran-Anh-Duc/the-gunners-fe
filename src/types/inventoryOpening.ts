export interface InventoryOpeningListParams {
  business_id?: number
  warehouse_id?: number
  product_id?: number

  opening_date_from?: string
  opening_date_to?: string

  keyword?: string

  page?: number
  per_page?: number

  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
export interface InventoryOpeningGroup {
	warehouse_id: number
	warehouse: {
		id: number
		code: string
		name: string
	}
	opening_date: string
	total_quantity: number
	total_cost: number
	details: InventoryOpening[]
}

export interface InventoryOpening {
	id: number
	product_id: number
	product_name: string
	unit_id: number
	unit_name: string
	quantity: string
	unit_cost: string
	total_cost: string
	note: string | null
}

export interface InventoryOpeningListData {
  items: InventoryOpeningGroup[]
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
}

export type InventoryOpeningTableRowType =
	| 'warehouse_summary'
	| 'product_header'
	| 'product'

export interface InventoryOpeningTableRow {
	row_type: InventoryOpeningTableRowType
	row_key: string
	warehouse_id: number

	// warehouse_summary
	warehouse_code?: string
	warehouse_name?: string
	warehouse_address?: string | null
	opening_date?: string
	total_quantity?: number
	warehouse_total_cost?: number

	// product
	index?: number
	opening_id?: number
	product_id?: number
	product_name?: string
	unit_id?: number
	unit_name?: string
	quantity?: string
	unit_cost?: string
	total_cost?: string
	note?: string | null
}

export interface InventoryOpeningForm {
	business_id?: number
	warehouse_id?: number
	product_id?: number
	product_name: string
	unit_id?: number
	unit_name: string
	opening_date: string
	quantity: number
	unit_cost: number
	note?: string | null
}


