import { http } from './client';

// 页面交互对应的后端契约。当前前端使用本地状态，接入后可直接替换调用。
export const interactionApi = {
  getRegions: () => http.get('/regions'),
  getServiceCategories: () => http.get('/service-categories'),
  claimNewUserCoupon: () => http.post('/promotions/new-user/claim'),
  getInviteInfo: () => http.get('/user/invite'),
  createInviteLink: () => http.post('/user/invite/link'),
  getPoints: () => http.get('/user/points'),
  getMembership: () => http.get('/user/membership'),
  getFavorites: (params = {}) => http.get('/user/favorite-therapists', params),
  getReviews: (params = {}) => http.get('/user/reviews', params),
  createReview: (body) => http.post('/user/reviews', body),
  getHealthProfile: () => http.get('/user/health-profile'),
  updateHealthProfile: (body) => http.put('/user/health-profile', body),
  getInvoices: (params = {}) => http.get('/user/invoices', params),
  applyInvoice: (body) => http.post('/user/invoices', body),
  getSettings: () => http.get('/user/settings'),
  updateSettings: (body) => http.patch('/user/settings', body),
  createSupportTicket: (body) => http.post('/support/tickets', body),
};
