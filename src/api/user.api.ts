import api from '@/utils/axios.ts'
import type {DataSearch, User, UserListData, CreateUserResponse, CreateUserRequest} from '@/types/user.ts'
import type {ApiResponse} from "@/types/api.ts";

const DOMAIN = 'users'

export const getUserList = (params: { per_page: any; phone: any; name: any; page: any; email: any }) => {
  return api.get<ApiResponse<UserListData>>(`${DOMAIN}`, {
    params,
  })
}
export const createUserApi = (data: CreateUserRequest) => {
  return api.post<ApiResponse<CreateUserResponse>>(`${DOMAIN}`, data)
}
export const showUserApi = (id:number) => {
  return api.get<ApiResponse<User>>(`${DOMAIN}/${id}`,)
}


