import request from '@/utils/request'

// 文化
export const getCulture = () => {
  return request.get('/cultures/all')
}


//特产
export const getSpecialty = () => {
  return request.get('/specialties/all')
}

//景区
export const getAttraction = () => {
  return request.get('attractions/all');
}

//用户
export const getUser = () => {
  return request.get('/user/all');
}