import api from './client'

export const groupsApi = {
  getGroups: () => api.get('/groups').then(r => r.data),
  getGroup: (id: string) => api.get(`/groups/${id}`).then(r => r.data),
  createGroup: (data: any) => api.post('/groups', data).then(r => r.data),
  joinGroup: (id: string) => api.post(`/groups/${id}/join`).then(r => r.data),
  leaveGroup: (id: string) => api.post(`/groups/${id}/leave`).then(r => r.data),
  getGroupPosts: (id: string) => api.get(`/groups/${id}/posts`).then(r => r.data),
  createPost: (groupId: string, data: any) => api.post(`/groups/${groupId}/posts`, data).then(r => r.data),
  getGroupMembers: (id: string) => api.get(`/groups/${id}/members`).then(r => r.data),
}
