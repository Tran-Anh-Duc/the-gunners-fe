import api from '@/utils/axios.ts'
import type { DataSearch, UserListData } from '@/types/user.ts'
import type {ApiResponse} from "@/types/api.ts";

const DOMAIN = 'users'

export const getUserList = (params: DataSearch) => {
  return api.get<ApiResponse<UserListData>>(`${DOMAIN}`, {
    params,
  })
}
