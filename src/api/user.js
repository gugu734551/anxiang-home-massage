import { http } from './client';
export const userApi = {
  getProfile: () => http.get('/user/profile'),
  updateProfile: (body) => http.put('/user/profile', body),
  getAddresses: () => http.get('/user/addresses'),
  createAddress: (body) => http.post('/user/addresses', body),
  updateAddress: (id, body) => http.put(`/user/addresses/${id}`, body),
  deleteAddress: (id) => http.delete(`/user/addresses/${id}`),
  getCoupons: (params = {}) => http.get('/user/coupons', params),
};
