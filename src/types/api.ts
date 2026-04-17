export interface LoginRequest {
	email: string
	password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}
export interface AuthUser {
  id: number
  name: string
  email: string
  business_id: number | null
  business_name: string | null
}

export interface ApiResponse<T> {
  status: boolean
  http_status: number
  code: string
  message: string
  data: T
  locale: string
}

export interface LogoutResponse {
  message: string
  locale: string
}
