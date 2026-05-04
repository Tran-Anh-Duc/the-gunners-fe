import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type {
	InventoryOpeningListParams,
	InventoryOpeningListData
} from '@/types/inventoryOpening.ts'

const DOMAIN = 'inventory-openings'

export const getInventoryOpeningsList = (params: InventoryOpeningListParams) => {
	return api.get<ApiResponse<InventoryOpeningListData>>(`${DOMAIN}`,{
		params
	})
}


