import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type {
	Customer,
	CustomerFormRequest,
	CustomerListData,
	CustomerListParams
} from '@/types/customer.ts'
const DOMAIN = 'customers'

export const getCustomerList = (params:CustomerListParams)=> {
	return api.get<ApiResponse<CustomerListData>>(`${DOMAIN}`,{
		params
	})
}
export const showCustomerApi = (id:number) => {
	return api.get<ApiResponse<Customer>>(`${DOMAIN}/${id}`)
}
export const createCustomerApi = (data:CustomerFormRequest) => {
	return api.post<ApiResponse<Customer>>(`${DOMAIN}`,data)
}
export const updateCustomerApi = (id:number,data:CustomerFormRequest) => {
	return api.put<ApiResponse<Customer>>(`${DOMAIN}/${id}`,data)
}
