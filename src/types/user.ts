interface DataSearch {
  keyword?: string
  page?: number
  limit?: number
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
}

export interface CreateUserResponse extends User {}