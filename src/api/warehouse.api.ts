import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type  {Warehouse, WarehouseListData, WarehouseFormRequest, WarehouseListParams } from '@/types/warehouse.ts'

const DOMAIN = 'warehouses'

export const getWarehouseList = (params: WarehouseListParams) => {
  return  api.get<ApiResponse<WarehouseListData>>(`${DOMAIN}`, {
    params
  })
}