import { apiAuth } from 'src/boot/axios'

export default {
  create: (data) => apiAuth.post('/diary', data),
  getMyHistory: () => apiAuth.get('/diary/me'),
  deleteById: (id) => apiAuth.delete(`/diary/${id}`),
}
