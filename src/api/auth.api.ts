import api from '@/utils/axios.ts'
import type { ApiResponse, LoginRequest, LoginResponse } from '@/types/api.ts'

const DOMAIN = 'auth'

export const loginApi = (data: LoginRequest) => {
	return api.post<ApiResponse<LoginResponse>>(`${DOMAIN}/login`, data)
}
