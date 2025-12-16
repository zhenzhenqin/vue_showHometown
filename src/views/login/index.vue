<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone, Picture } from '@element-plus/icons-vue'
import { getCaptchaImage, userLogin, userRegister } from '@/api/api'

const router = useRouter()
const isLogin = ref(true) // true显示登录，false显示注册
const loading = ref(false)

// 验证码数据
const captchaUrl = ref('')
const verifyKey = ref('') // uuid

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  code: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  code: ''
})

// 1. 获取验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptchaImage()
    if (res.code === 1) {
      captchaUrl.value = 'data:image/jpg;base64,' + res.data.img
      verifyKey.value = res.data.uuid
    }
  } catch (error) {
    console.error('验证码获取失败', error)
  }
}

// 2. 登录逻辑
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password || !loginForm.code) {
    return ElMessage.warning('请填写完整信息')
  }
  
  loading.value = true
  try {
    const res = await userLogin({
      ...loginForm,
      uuid: verifyKey.value
    })
    
    if (res.code === 1) {
      ElMessage.success('欢迎回来，' + res.data.username)
      // 存储 Token 和用户信息
      localStorage.setItem('token', res.data.token || 'mock_token') 
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      
      router.push('/index')
    } else {
      ElMessage.error(res.msg || '登录失败')
      refreshCaptcha() // 失败刷新验证码
    }
  } catch (err) {
    ElMessage.error('服务异常')
  } finally {
    loading.value = false
  }
}

// 3. 注册逻辑
const handleRegister = async () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    return ElMessage.warning('两次输入的密码不一致')
  }
  
  loading.value = true
  try {
    const res = await userRegister({
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone,
      code: registerForm.code,
      uuid: verifyKey.value
    })
    
    if (res.code === 1) {
      ElMessage.success('注册成功，已自动填充账号密码')
      // 切换到登录并填充
      isLogin.value = true
      loginForm.username = registerForm.username
      loginForm.password = registerForm.password
      loginForm.code = '' // 验证码需要重新输入
      refreshCaptcha()
    } else {
      ElMessage.error(res.msg || '注册失败')
      refreshCaptcha()
    }
  } catch (err) {
    ElMessage.error('注册异常')
  } finally {
    loading.value = false
  }
}

// 切换模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  refreshCaptcha() // 切换时刷新验证码
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<template>
  <div class="login-container">
    <div class="bg-overlay"></div>
    
    <div class="login-box">
      <div class="login-left">
        <div class="welcome-text">
          <h2>南孔圣地</h2>
          <h1>衢州有礼</h1>
          <p>探索浙西山水，品味千年文化</p>
        </div>
      </div>
      
      <div class="login-right">
        <div class="form-header">
          <h3>{{ isLogin ? '账号登录' : '注册新账号' }}</h3>
          <p class="switch-tip">
            {{ isLogin ? '还没有账号？' : '已有账号？' }}
            <span @click="toggleMode">{{ isLogin ? '去注册' : '去登录' }}</span>
          </p>
        </div>

        <div v-if="isLogin" class="form-content fade-in">
          <div class="input-group">
            <el-icon><User /></el-icon>
            <input v-model="loginForm.username" type="text" placeholder="请输入用户名" />
          </div>
          <div class="input-group">
            <el-icon><Lock /></el-icon>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" />
          </div>
          <div class="input-group captcha-group">
            <el-icon><Picture /></el-icon>
            <input v-model="loginForm.code" type="text" placeholder="验证码" />
            <img :src="captchaUrl" @click="refreshCaptcha" alt="验证码" class="captcha-img" />
          </div>
          <button class="submit-btn" @click="handleLogin" :disabled="loading">
            {{ loading ? '登录中...' : '立即登录' }}
          </button>
        </div>

        <div v-else class="form-content fade-in">
          <div class="input-group">
            <el-icon><User /></el-icon>
            <input v-model="registerForm.username" type="text" placeholder="设置用户名" />
          </div>
          <div class="input-group">
            <el-icon><Iphone /></el-icon>
            <input v-model="registerForm.phone" type="text" placeholder="手机号码" />
          </div>
          <div class="input-group">
            <el-icon><Lock /></el-icon>
            <input v-model="registerForm.password" type="password" placeholder="设置密码" />
          </div>
          <div class="input-group">
            <el-icon><Lock /></el-icon>
            <input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" />
          </div>
          <div class="input-group captcha-group">
            <el-icon><Picture /></el-icon>
            <input v-model="registerForm.code" type="text" placeholder="验证码" />
            <img :src="captchaUrl" @click="refreshCaptcha" alt="验证码" class="captcha-img" />
          </div>
          <button class="submit-btn register-btn" @click="handleRegister" :disabled="loading">
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  /* 背景图：衢州山水风格 */
  background: url('https://images.unsplash.com/photo-1505991285609-b68c937229b3?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.bg-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(26, 94, 56, 0.2); /* 衢州绿蒙版 */
  backdrop-filter: blur(3px);
}

.login-box {
  width: 900px;
  height: 550px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 10;
}

/* 左侧装饰区 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1a5e38 0%, #43a047 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background: url('https://www.transparenttextures.com/patterns/cubes.png');
  opacity: 0.1;
  animation: moveBackground 60s linear infinite;
}

.welcome-text {
  position: relative;
  text-align: center;
  z-index: 2;
}

.welcome-text h2 { font-size: 1.8rem; font-weight: 300; letter-spacing: 5px; margin-bottom: 5px; }
.welcome-text h1 { font-size: 3.5rem; font-weight: 700; letter-spacing: 8px; margin-bottom: 20px; font-family: "KaiTi", serif; }
.welcome-text p { font-size: 1rem; opacity: 0.8; letter-spacing: 2px; }

/* 右侧表单区 */
.login-right {
  flex: 1.2;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header h3 { font-size: 1.8rem; color: #1a5e38; margin-bottom: 10px; }
.switch-tip { font-size: 0.9rem; color: #666; margin-bottom: 30px; }
.switch-tip span { color: #1a5e38; font-weight: bold; cursor: pointer; margin-left: 5px; text-decoration: underline; }

.input-group {
  position: relative;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  transition: border-color 0.3s;
}

.input-group:focus-within { border-color: #1a5e38; }
.input-group .el-icon { font-size: 1.2rem; color: #999; margin-right: 10px; }
.input-group input {
  width: 100%;
  padding: 12px 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  color: #333;
}

.captcha-group { display: flex; justify-content: space-between; border-bottom: none; gap: 10px; }
.captcha-group input { border-bottom: 2px solid #e0e0e0; }
.captcha-group input:focus { border-color: #1a5e38; }
.captcha-img { height: 40px; cursor: pointer; border-radius: 4px; border: 1px solid #eee; }

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #1a5e38;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  box-shadow: 0 5px 15px rgba(26, 94, 56, 0.3);
}

.submit-btn:hover { background: #2a7d4a; transform: translateY(-2px); }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

/* 动画 */
.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes moveBackground { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* 响应式 */
@media (max-width: 768px) {
  .login-box { width: 90%; height: auto; flex-direction: column; }
  .login-left { padding: 40px 20px; }
  .login-right { padding: 40px 20px; }
}
</style>