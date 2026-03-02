import { apiAuth } from 'src/boot/axios'

export default {
  create: () => apiAuth.post('/order'),
  get: () => apiAuth.get('/order'),
  getAll: () => apiAuth.get('/order/all'),
  remove: (id) => apiAuth.delete(`/order/${id}`),
}
