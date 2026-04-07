import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type { Category, CategoryFormRequest, CategoryListData, CategoryListParams } from '@/types/category.ts'

const DOMAIN = 'categories'

export const getCategoryList = (params: CategoryListParams) => {
	return api.get<ApiResponse<CategoryListData>>(`${DOMAIN}`,{
		params
	})
}
export const showCategoryApi = (id:number) => {
	return api.get<ApiResponse<Category>>(`${DOMAIN}/${id}`)
}
export const updateCategoryApi = (id:number,data:CategoryFormRequest) => {
	return api.put<ApiResponse<Category>>(`${DOMAIN}/${id}`,data)
}
export const createCategoryApi = (data:CategoryFormRequest) => {
	return api.post<ApiResponse<Category>>(`${DOMAIN}`,data)
}
