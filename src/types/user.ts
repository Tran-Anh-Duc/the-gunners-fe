export interface DataSearch {
  name?: string
  email?: string
  phone?: string
  page?: number
  per_page?: number
}

export interface User {
  id: number
  business_id: number
  business_name: string
  name: string
  email: string
  phone: string
  avatar: string | null
  is_active: boolean
  role: string
  membership_status: string
  is_owner: boolean
  joined_at: string
  last_login_at: string
}

export interface UserListData {
  items: User[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface CreateUserRequest {
	name: string
	email: string
	password: string
	phone?: string
	avatar?: string | null
	is_active?: boolean
	business_id?: number | null
	role?: string
}


export interface UpdateUserPayload {
	name: string
	email: string
	password?: string
	phone?: string
	role?: string
	membership_status?: string
	is_owner?: boolean
	is_active?: boolean
	business_id?: number
	avatar?: string | null
}


export interface CreateUserResponse extends User {}
