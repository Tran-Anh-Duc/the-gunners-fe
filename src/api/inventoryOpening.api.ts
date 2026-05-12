import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type {
	InventoryOpeningListParams,
	InventoryOpeningListData,
	InventoryOpening,
	InventoryOpeningForm
} from '@/types/inventoryOpening.ts'

const DOMAIN = 'inventory-openings'

export const getInventoryOpeningsList = (params: InventoryOpeningListParams) => {
	return api.get<ApiResponse<InventoryOpeningListData>>(`${DOMAIN}`,{
		params
	})
}

export const createInventoryOpeningApi = (data: InventoryOpeningForm) => {
	return api.post<ApiResponse<InventoryOpening>>(`${DOMAIN}`, data)
}

export const showInventoryOpeningApi = (id: number) => {
	return api.get<ApiResponse<InventoryOpening>>(`${DOMAIN}/${id}`)
}

export const updateInventoryOpeningApi = (id: number, data: InventoryOpeningForm) => {
	return api.put<ApiResponse<InventoryOpening>>(`${DOMAIN}/${id}`, data)
}


