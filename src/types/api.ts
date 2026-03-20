export interface LoginRequest {
	email: string
	password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface ApiResponse<T> {
  status: boolean
  http_status: number
  code: string
  message: string
  data: T
  locale: string
}