import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refresh = localStorage.getItem(REFRESH_TOKEN)

      if (!refresh) {
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
       const res = await axios.post(
       `${import.meta.env.VITE_APP_API_URL}/refresh/`,
       { refresh })        
        const newAccess = res.data.access

        localStorage.setItem(ACCESS_TOKEN, newAccess)

        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api