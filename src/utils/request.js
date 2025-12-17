import axios from 'axios'

// 创建axios实例对象
const request = axios.create({
  baseURL: '/api', // 代理前缀
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json' // 请求头
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么

    //获取当前登录用户的id
    const user = JSON.parse(localStorage.getItem('userInfo'))
    const userId = user ? user.id : null

    //  如果存在 ID，则添加到请求头中
    if (userId) {
      // 后端通过 request.getHeader("User-ID") 获取 
      config.headers['User-ID'] = userId
    }

    return config
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理后端返回格式
request.interceptors.response.use(
  response => {
    // 直接返回后端的数据，因为后端已经封装好了
    return response.data
  },
  error => {
    console.error('请求错误:', error)
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default request