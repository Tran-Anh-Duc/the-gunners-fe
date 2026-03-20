import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

// 🔑 Request interceptor (gắn token)
api.interceptors.request.use(
  (config) => {
    const token: string | null = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ❌ Response interceptor (handle lỗi)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // token hết hạn / chưa login
      localStorage.removeItem('token')

      // redirect login
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
