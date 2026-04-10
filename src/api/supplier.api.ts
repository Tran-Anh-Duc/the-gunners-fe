import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type { Supplier, SupplierFormRequest, SupplierListData, SupplierListParams } from '@/types/supplier.ts'

const DOMAIN = 'suppliers'

export const getSuppliersList = (params: SupplierListParams) => {
	return api.get<ApiResponse<SupplierListData>>(`${DOMAIN}`,{
		params
	})
}
export const showSupplierApi = (id:number) => {
	return api.get<ApiResponse<Supplier>>(`${DOMAIN}/${id}`)
}
export const createSupplierApi = (data:SupplierFormRequest) => {
	return api.post<ApiResponse<Supplier>>(`${DOMAIN}`,data)
}
export const updateSupplierApi = (id:number,data:SupplierFormRequest) => {
	return api.put<ApiResponse<Supplier>>(`${DOMAIN}/${id}`,data)
}
