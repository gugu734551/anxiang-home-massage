import { http } from './client';
export const therapistApi = {
  getList: (params = { page: 1, pageSize: 10 }) => http.get('/therapists', params),
  getDetail: (id) => http.get(`/therapists/${id}`),
  getRecommended: (params = {}) => http.get('/therapists/recommended', params),
  follow: (id) => http.post(`/therapists/${id}/follow`),
  unfollow: (id) => http.delete(`/therapists/${id}/follow`),
};
