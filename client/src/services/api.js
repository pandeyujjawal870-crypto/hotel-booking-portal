import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

export const hotelApi = {
  search: (params) => api.get('/hotels', { params }).then(({ data }) => data),
  get: (id) => api.get(`/hotels/${id}`).then(({ data }) => data),
  create: (payload) => api.post('/hotels', payload).then(({ data }) => data),
  remove: (id) => api.delete(`/hotels/${id}`),
}

export const bookingApi = {
  create: (payload) => api.post('/bookings', payload).then(({ data }) => data),
  lookup: (reference, email) => api.get('/bookings/lookup', {
    params: { reference, email },
  }).then(({ data }) => data),
  cancel: (reference, email) => api.post(`/bookings/${reference}/cancel`, {
    email,
  }).then(({ data }) => data),
}

export const getApiError = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.'
