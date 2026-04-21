import api from '@/utils/axios.ts'
import type { ApiResponse } from '@/types/api.ts'
import type {
	WarehouseDocumentListData,
	WarehouseDocumentListParams,
	WarehouseDocument,
	WarehouseDocumentFormRequest
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
export const createWarehouseDocumentApi = (data: WarehouseDocumentFormRequest) => {
	return api.post<ApiResponse<WarehouseDocument>>(`${DOMAIN}`,data)
}
export const updateWarehouseDocumentApi = (id:number,data:WarehouseDocumentFormRequest) => {
	return api.put<ApiResponse<WarehouseDocument>>(`${DOMAIN}/${id}`,data)
}

