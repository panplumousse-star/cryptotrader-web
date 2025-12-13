import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { useAuthStore } from '@/stores'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and request ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add unique request ID for tracing and debugging
    if (config.headers) {
      config.headers['X-Request-ID'] = uuidv4()
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on auth pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
