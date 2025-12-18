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

// 分页查询景区列表
export const listAllAttractions = (name, location, score, page, pageSize) => {
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (location) params.append('location', location);
  if (score !== null && score !== undefined) params.append('score', score);
  params.append('page', page);
  params.append('pageSize', pageSize);
  return request.get(`/attractions?${params.toString()}`);
};