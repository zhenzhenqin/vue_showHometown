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

//根据用户id查询用户信息
export const getUserById = (id) => {
  return request.get(`/user/${id}`);
}

//获取图形验证码
export const getCaptchaImage = () => {
  return request.get('/captchaImage')
}

//用户登录
export const userLogin = (data) => {
  return request.post('/user/login', data)
}

//  用户注册
export const userRegister = (data) => {
  return request.post('/user/register', data)
}