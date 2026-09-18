import { http } from './client';
export const bookingApi = {
  getAvailableDates: () => http.get('/booking/available-dates'),
  getAvailableTimes: (params) => http.get('/booking/available-times', params),
  getServices: (params = {}) => http.get('/services', params),
  getAvailableTherapists: (params) => http.get('/therapists/available', params),
  calculatePrice: (body) => http.post('/booking/calculate', body),
  createOrder: (body) => http.post('/orders', body),
};
