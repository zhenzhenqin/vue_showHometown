import request from '@/utils/request'

// AI问答
export const aiChat = (data) => {
  return request.post('/ai/chat', data)
}

// 获取会话历史
export const getAiHistory = (sessionId) => {
  return request.get(`/ai/history/${sessionId}`)
}

// 删除会话
export const deleteAiSession = (sessionId) => {
  return request.delete(`/ai/session/${sessionId}`)
}

// 获取用户会话列表
export const getAiSessions = () => {
  return request.get('/ai/sessions')
}
