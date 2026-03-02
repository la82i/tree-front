import { api, apiAuth } from 'src/boot/axios'

export default {
  create: (data) => api.post('/user', data),
  login: (data) => api.post('/user/login', data),
  profile: () => apiAuth.get('/user/profile'),
  refresh: () => apiAuth.patch('/user/refresh'),
  logout: () => apiAuth.delete('/user/logout'),
  cart: (data) => apiAuth.patch('/user/cart', data),
  getCart: () => apiAuth.get('/user/cart'),
}
