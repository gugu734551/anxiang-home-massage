import { http } from './client';
export const homeApi = {
  getHome: () => http.get('/home'),
  getCategories: () => http.get('/service-categories'),
  getPopularServices: (params = { page: 1, pageSize: 10 }) => http.get('/services/popular', params),
  getBanners: () => http.get('/banners', { position: 'home' }),
};
