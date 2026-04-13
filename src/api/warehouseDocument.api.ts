import api from '@/utils/axios.ts'
import type { ApiResponse } from '@/types/api.ts'
import type {
	WarehouseDocumentListData,
	WarehouseDocumentListParams,
	WarehouseDocument,
} from '@/types/WarehouseDocument.ts'

const DOMAIN = 'warehouse-documents'

export const getWarehouseDocumentList = (params: WarehouseDocumentListParams) => {
	return api.get<ApiResponse<WarehouseDocumentListData>>(`${DOMAIN}`,{
		params
	})
}
export const showWarehouseDocumentApi = (id:number) => {
	return api.get<ApiResponse<WarehouseDocument>>(`${DOMAIN}/${id}`)
}
