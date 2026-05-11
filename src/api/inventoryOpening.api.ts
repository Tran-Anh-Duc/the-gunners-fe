import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type {
	InventoryOpeningListParams,
	InventoryOpeningListData,
	InventoryOpening
} from '@/types/inventoryOpening.ts'

const DOMAIN = 'inventory-openings'

export const getInventoryOpeningsList = (params: InventoryOpeningListParams) => {
	return api.get<ApiResponse<InventoryOpeningListData>>(`${DOMAIN}`,{
		params
	})
}

export const createInventoryOpeningApi = (data: InventoryOpeningListData) => {
	return api.post<ApiResponse<InventoryOpening>>(`${DOMAIN}`, data)
}


