import api from '@/utils/axios.ts'
import type {ApiResponse} from "@/types/api.ts";
import type { UnitListData, UnitListParams } from '@/types/unit.ts'
const DOMAIN = 'units'

export const getUnitList  = (params: UnitListParams) => {
  return api.get<ApiResponse<UnitListData>>(`${DOMAIN}`,{
    params
  })
}