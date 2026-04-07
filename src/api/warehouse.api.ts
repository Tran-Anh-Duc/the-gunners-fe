import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type  {Warehouse, WarehouseListData, WarehouseFormRequest, WarehouseListParams } from '@/types/warehouse.ts'

const DOMAIN = 'warehouses'

export const getWarehouseList = (params: WarehouseListParams) => {
  return  api.get<ApiResponse<WarehouseListData>>(`${DOMAIN}`, {
    params
  })
}
export const showWarehouseApi = (id: number) => {
  return api.get<ApiResponse<Warehouse>>(`${DOMAIN}/${id}`)
}
export const updateUnitApi = (id:number,data:WarehouseFormRequest) => {
	return api.put<ApiResponse<Warehouse>>(`${DOMAIN}/${id}`,data)
}
