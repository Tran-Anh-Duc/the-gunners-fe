import api from '@/utils/axios.ts'
import type { ApiResponse } from '@/types/api.ts'
import type {
	Product,
	ProductListParams,
	ProductFormRequest,
	ProductListData,
} from '@/types/product.ts'

const DOMAIN = 'products'

export const getProductList = (params: ProductListParams) => {
	return api.get<ApiResponse<ProductListData>>(`${DOMAIN}`, {
		params,
	})
}
export const showProductApi = (id: number) => {
	return api.get<ApiResponse<Product>>(`${DOMAIN}/${id}`)
}
