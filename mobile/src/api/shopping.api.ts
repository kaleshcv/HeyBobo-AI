import api from './client'

export const shoppingApi = {
  getLists: () => api.get('/shopping/lists').then(r => r.data),
  createList: (data: any) => api.post('/shopping/lists', data).then(r => r.data),
  updateList: (id: string, data: any) => api.patch(`/shopping/lists/${id}`, data).then(r => r.data),
  deleteList: (id: string) => api.delete(`/shopping/lists/${id}`).then(r => r.data),
  getMarketplaceListings: (params?: any) => api.get('/shopping/marketplace', { params }).then(r => r.data),
  createListing: (data: any) => api.post('/shopping/marketplace', data).then(r => r.data),
  getOrders: () => api.get('/shopping/orders').then(r => r.data),
  getBudget: () => api.get('/shopping/budget').then(r => r.data),
  updateBudget: (data: any) => api.patch('/shopping/budget', data).then(r => r.data),
}
