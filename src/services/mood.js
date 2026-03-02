import { api, apiAuth } from 'src/boot/axios'

export default {
  getAll: () => api.get('/mood'),
  create: (data) => apiAuth.post('/mood', data),
  remove: (id) => apiAuth.delete(`/mood/${id}`),
}
