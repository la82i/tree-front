import { api, apiAuth } from 'src/boot/axios'

export default {
  getRandom: () => api.get('/card/random'),
  getAll: () => api.get('/card/all'),
  create: (data) => apiAuth.post('/card', data),
  update: (id, data) => apiAuth.patch(`/card/${id}`, data),
  remove: (id) => apiAuth.delete(`/card/${id}`),
}
