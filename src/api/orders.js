import { http } from './client';
export const orderApi = {
  getList: (params = { page: 1, pageSize: 10 }) => http.get('/orders', params),
  getDetail: (id) => http.get(`/orders/${id}`),
  cancel: (id, body) => http.post(`/orders/${id}/cancel`, body),
  reorder: (id) => http.post(`/orders/${id}/reorder`),
};
