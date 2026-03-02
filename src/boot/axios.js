import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { useUserStore } from 'src/stores/user'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiAuth.interceptors.request.use((config) => {
  const user = useUserStore()
  config.headers.Authorization = `Bearer ${user.token}`
  return config
})

apiAuth.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response && error.config.url !== '/user/refresh' && error.response.status === 401) {
      const user = useUserStore()
      try {
        const { data } = await apiAuth.patch('/user/refresh')
        user.token = data.result.token

        error.config.headers.Authorization = `Bearer ${user.token}`
        return apiAuth(error.config)
      } catch (refreshError) {
        user.logout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  app.config.globalProperties.$apiAuth = apiAuth
})

export { api, apiAuth }
