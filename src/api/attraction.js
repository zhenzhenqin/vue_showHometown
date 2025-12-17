import request from '@/utils/request'

//景区
export const getAttraction = () => {
  return request.get('attractions/all');
}

// 点赞 (调用一次为点赞，再调用一次为取消)
export const likeAttraction = (id) => {
  return request.get(`attractions/likes/${id}`);
}

// 差评 (调用一次为差评，再调用一次为取消)
export const dislikeAttraction = (id) => {
  return request.get(`attractions/dislikes/${id}`);
}