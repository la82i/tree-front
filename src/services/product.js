import { api, apiAuth } from 'src/boot/axios'

export default {
  create: (data) => apiAuth.post('/product', data),
  getAll: () => apiAuth.get('/product/all'),
  update: (id, data) => apiAuth.patch(`/product/${id}`, data),
  remove: (id) => apiAuth.delete(`/product/${id}`),
  getRecommend: (moodId) => api.get(`/product/recommend/${moodId}`),
  get: () => api.get('/product'),
  getId: (id) => api.get(`/product/${id}`),
}
