import request from '@/utils/request'

//用户
export const getUser = () => {
  return request.get('/user/all');
}

//更新用户信息
export const updateUser = (user) => {
  return request.put('/user', user)
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

//用户修改密码
export const userEditPassword = (data) => {
  return request.post('/user/editPassword', data)
}