
export interface UnitListParams {
	page?: number
	per_page?: number
	sort_by?: string
	sort_order?: 'asc' | 'desc'
	code?: string
	name?: string
	is_option?: boolean | number
}

export interface Unit {
  id: number
  business_id: number
  code: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UnitFormRequest {
  code?: string
  name: string
  description?: string | null
  is_active?: boolean
}


export interface UnitListData {
  items: Unit[]
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
}
export interface UnitFormState {
	id: number
	business_id: number | null
	name: string
	description: string | null
	is_active: boolean
	code: string
}
export interface UnitOption {
	id: number
	name: string
}
export type UnitOptionListData  = UnitOption[]
