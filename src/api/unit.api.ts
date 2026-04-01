import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type { Unit, UnitFormRequest, UnitListData, UnitListParams } from '@/types/unit.ts'
const DOMAIN = 'units'

export const getUnitList  = (params: UnitListParams) => {
  return api.get<ApiResponse<UnitListData>>(`${DOMAIN}`,{
    params
  })
}
export const showUnitApi = (id:number) => {
  return api.get<ApiResponse<Unit>>(`${DOMAIN}/${id}`)
}
export const updateUnitApi = (id:number, data:UnitFormRequest) => {
  return api.put<ApiResponse<Unit>>(`${DOMAIN}/${id}`,data)
}
export const createUnitApi = (data: UnitFormRequest) => {
  return api.post<ApiResponse<Unit>>(`${DOMAIN}`,data)
}