<template>
  <div class="user-profile-container">
    <div class="user-profile-header">
      <div class="header-content">
        <h1>个人主页</h1>
        <p>记录与分享，专注衢州本地内容创作</p>
        
        <button class="edit-profile-btn" @click="handleEdit">
          <el-icon><Edit /></el-icon> 编辑资料
        </button>
        
        <div class="divider"></div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载个人信息...</p>
    </div>

    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <p>请登陆后查看</p>
      <button @click="fetchUserProfile" class="retry-btn">重新加载</button>
    </div>

    <div v-else class="user-profile-main">
      <div class="avatar-section">
        <div class="avatar-container">
          <div class="twitter-style-avatar">
            <span class="avatar-initial">{{ userInitial }}</span>
          </div>
          <p class="avatar-name">{{ userProfile.realName || '未设置姓名' }}</p>
          <p class="avatar-username">@{{ userProfile.username }}</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-section intro-section">
          <h3 class="section-title">
            <i class="section-icon">✏️</i> 个人简介
          </h3>
          <p class="intro-content">
            {{ userProfile.introduction || '暂无个人简介，欢迎补充更多关于你的信息～' }}
          </p>
        </div>

        <div class="info-section contact-section">
          <h3 class="section-title">
            <i class="section-icon">📞</i> 联系方式
          </h3>
          <div class="contact-list">
            <div class="contact-item">
              <i class="contact-icon">📧</i>
              <span class="contact-label">邮箱：</span>
              <span class="contact-value">{{ userProfile.email || '未绑定' }}</span>
            </div>
            <div class="contact-item">
              <i class="contact-icon">📱</i>
              <span class="contact-label">手机：</span>
              <span class="contact-value">{{ formatPhone(userProfile.phone) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section account-section">
          <h3 class="section-title">
            <i class="section-icon">🔍</i> 账号信息
          </h3>
          <div class="account-list">
            <div class="account-item">
              <span class="account-label">账号创建时间：</span>
              <span class="account-value">{{ formatDate(userProfile.createTime) }}</span>
            </div>
            <div class="account-item">
              <span class="account-label">信息最后更新：</span>
              <span class="account-value">{{ formatDate(userProfile.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px"
      :close-on-click-modal="false"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="80px" class="edit-form">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled placeholder="用户名不可修改" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱地址">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input 
            v-model="editForm.introduction" 
            type="textarea" 
            :rows="3" 
            placeholder="介绍一下自己吧..." 
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">保存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { getUserById, updateUser } from '@/api/user' 
import { Edit } from '@element-plus/icons-vue' 
import { ElMessage } from 'element-plus'

// 响应式数据
const userProfile = ref({
  id: null,
  realName: '',
  username: '',
  email: '',
  phone: '',
  introduction: '',
  createTime: '',
  updateTime: ''
})
const loading = ref(false)
const error = ref(null)

// 编辑相关数据
const editDialogVisible = ref(false)
const submitting = ref(false)
const editForm = reactive({
  id: null,
  username: '',
  realName: '',
  phone: '',
  email: '',
  introduction: ''
})

// 计算属性：真实姓名首字母（默认头像）
const userInitial = computed(() => {
  return userProfile.value.realName ? userProfile.value.realName.charAt(0).toUpperCase() : 'U'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无数据'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

// 获取当前用户ID
const userInfoStr = localStorage.getItem('userInfo')
const currentId = userInfoStr ? JSON.parse(userInfoStr).id : null

// 获取个人信息
const fetchUserProfile = async () => {
  if (!currentId) {
    error.value = '未找到用户信息，请重新登录'
    return
  }
  try {
    loading.value = true
    error.value = null
    const response = await getUserById(currentId)
    if (response.code === 1 && response.data) {
      const { password, ...safeData } = response.data
      userProfile.value = safeData
    } else {
      throw new Error('个人信息获取失败')
    }
  } catch (err) {
    console.error('获取个人信息异常:', err)
    error.value = err.message || '数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 打开编辑弹窗
const handleEdit = () => {
  // 将当前展示的数据复制到编辑表单
  editForm.id = userProfile.value.id
  editForm.username = userProfile.value.username
  editForm.realName = userProfile.value.realName
  editForm.phone = userProfile.value.phone
  editForm.email = userProfile.value.email
  editForm.introduction = userProfile.value.introduction
  editDialogVisible.value = true
}

// 提交修改
const submitEdit = async () => {
  submitting.value = true
  try {
    const res = await updateUser(editForm)
    if (res.code === 1) {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      fetchUserProfile() // 刷新数据
    } else {
      ElMessage.error(res.msg || '修改失败')
    }
  } catch (err) {
    ElMessage.error('系统异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  fetchUserProfile()
})
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #1a5e38;
  --primary-light: #2a7d4a;
  --secondary-color: #e8f4ea;
  --text-dark: #333;
  --text-medium: #666;
  --text-light: #999;
  --white: #fff;
  --shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  --shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.22);
  --border-light: #f0f0f0;
  --radius: 12px;
  --transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  --avatar-size: 160px;
  --avatar-border-width: 2px;
  --avatar-border-color: var(--primary-color);
  --avatar-bg: #e6f7ee;
  --avatar-text-color: var(--primary-color);
  --texture-pattern: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.user-profile-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 头部样式 */
.user-profile-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
    url('https://picsum.photos/id/177/1920/500') center/cover no-repeat;
  color: var(--white);
  padding: 60px 20px;
  text-align: center;
  position: relative;
  box-shadow: var(--shadow);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.user-profile-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.user-profile-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 25px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 新增：编辑按钮样式 */
.edit-profile-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  margin-bottom: 25px;
}

.edit-profile-btn:hover {
  background-color: white;
  color: #1a5e38;
  transform: translateY(-2px);
}

.divider {
  width: 80px;
  height: 3px;
  background-color: #fff;
  margin: 0 auto;
  border-radius: 3px;
  opacity: 0.8;
}

/* 加载/错误状态 */
.loading, .error {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-medium);
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 600px;
  margin: 40px auto;
}

.spinner {
  width: 50px; height: 50px;
  border: 5px solid var(--secondary-color);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin: 0 auto 25px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error-icon { font-size: 40px; margin-bottom: 20px; color: #e74c3c; }
.retry-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 15px;
}

/* 个人信息主体 */
.user-profile-main {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
}

/* 左侧：头像 */
.avatar-section { flex: 0 0 280px; display: flex; justify-content: center; align-items: flex-start; }
.avatar-container { text-align: center; padding: 20px; }
.twitter-style-avatar {
  width: var(--avatar-size); height: var(--avatar-size);
  border-radius: 50%;
  border: var(--avatar-border-width) solid var(--avatar-border-color);
  background-color: var(--avatar-bg);
  display: flex; justify-content: center; align-items: center;
  margin: 0 auto 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  transition: var(--transition);
}
.twitter-style-avatar:hover { transform: scale(1.05); box-shadow: 0 6px 12px rgba(0,0,0,0.12); }
.avatar-initial { font-size: 4rem; font-weight: 700; color: var(--avatar-text-color); }
.avatar-name { font-size: 1.5rem; color: var(--text-dark); margin: 0 0 5px; font-weight: 600; }
.avatar-username { font-size: 1rem; color: var(--text-light); margin: 0; }

/* 右侧：信息卡片 */
.info-card {
  flex: 1; min-width: 300px; max-width: 700px;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  padding: 30px;
  background-image: var(--texture-pattern);
}

.info-section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid var(--border-light); }
.info-section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.section-title { font-size: 1.2rem; color: var(--primary-color); margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
.intro-content { font-size: 1rem; color: var(--text-medium); line-height: 1.7; padding: 15px; background-color: var(--secondary-color); border-radius: 8px; }

.contact-list, .account-list { padding: 0; list-style: none; }
.contact-item, .account-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 1rem; }
.contact-icon { color: var(--primary-color); width: 20px; text-align: center; }
.contact-label, .account-label { color: var(--text-light); width: 80px; }
.contact-value, .account-value { color: var(--text-dark); flex: 1; }

/* 编辑表单样式 */
.edit-form { padding: 10px 20px 0 0; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 10px; }

/* 响应式 */
@media (max-width: 768px) {
  .user-profile-main { padding: 40px 15px; gap: 30px; }
  .avatar-section { flex: 0 0 100%; margin-bottom: 10px; }
  :root { --avatar-size: 140px; }
  .avatar-initial { font-size: 3.5rem; }
  .info-card { padding: 20px; width: 100%; }
}
</style>