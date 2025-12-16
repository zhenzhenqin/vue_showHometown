<script setup>
import {
  ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem,
  ElRow, ElCol, ElCard, ElCarousel, ElCarouselItem, ElDropdown, ElDropdownMenu, ElDropdownItem, ElAvatar,
  ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElMessageBox
} from 'element-plus';
import {
  UserFilled, SwitchButton, User, CaretBottom, Lock, Edit
} from '@element-plus/icons-vue'; 
import { useRouter } from 'vue-router';
import { onMounted, ref, watch, computed, reactive } from 'vue';
import { userEditPassword } from '@/api/user'; // 引入修改密码接口

const router = useRouter();
const screenWidth = ref(window.innerWidth);
const currentPath = ref(router.currentRoute.value.path);
const isScrolled = ref(false);

// ---- 用户登录状态管理 ----
const userInfo = ref(null);
const isLogin = computed(() => !!userInfo.value);

// 检查本地存储中的用户信息
const checkLogin = () => {
  const userStr = localStorage.getItem('userInfo');
  if (userStr) {
    try {
      userInfo.value = JSON.parse(userStr);
    } catch (e) {
      userInfo.value = null;
    }
  } else {
    userInfo.value = null;
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    userInfo.value = null;
    router.push('/login');
    ElMessage.success('已退出登录');
  }).catch(() => {});
};

// 跳转登录
const goToLogin = () => {
  router.push('/login');
};

// ---- 修改密码逻辑 (新增) ----
const passDialogVisible = ref(false);
const passFormRef = ref(null);
const passLoading = ref(false);

const passForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 校验规则
const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passForm.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const passRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
};

// 打开修改密码弹窗
const openPassDialog = () => {
  passDialogVisible.value = true;
  if (passFormRef.value) passFormRef.value.resetFields();
  passForm.oldPassword = '';
  passForm.newPassword = '';
  passForm.confirmPassword = '';
};

// 提交修改密码
const submitPass = () => {
  if (!passFormRef.value) return;
  passFormRef.value.validate(async (valid) => {
    if (valid) {
      passLoading.value = true;
      try {
        const params = {
          userId: userInfo.value.id, // 从当前登录信息获取ID
          oldPassword: passForm.oldPassword,
          newPassword: passForm.newPassword
        };
        
        const res = await userEditPassword(params);
        
        if (res.code === 1) {
          ElMessage.success('密码修改成功，请重新登录');
          passDialogVisible.value = false;
          // 修改成功后强制退出
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          userInfo.value = null;
          router.push('/login');
        } else {
          ElMessage.error(res.msg || '修改失败，请检查旧密码');
        }
      } catch (error) {
        console.error(error);
        ElMessage.error('系统异常，请稍后重试');
      } finally {
        passLoading.value = false;
      }
    }
  });
};

// -----------------------

// 监听路由变化，控制导航栏样式
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    currentPath.value = newPath;
    if (newPath !== '/index') {
      isScrolled.value = true;
    } else {
      isScrolled.value = window.scrollY > 30;
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkLogin();
  const handleResize = () => { screenWidth.value = window.innerWidth; };
  window.addEventListener('resize', handleResize);
  const handleScroll = () => {
    if (currentPath.value === '/index') {
      isScrolled.value = window.scrollY > 30;
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
});

// 轮播图数据
const carouselImages = [
  { url: '/images/quzhou.jpg', alt: '衢州风景' },
  { url: '/images/qu3.jpg', alt: '文化展示' },
  { url: '/images/qu6.jpg', alt: '特产介绍' },
  { url: '/images/qu2.jpg', alt: '景区风光' }
];

// 核心菜单配置
const menuItems = [
  { path: '/index', label: '首页' },
  { path: '/culture', label: '文化' },
  { path: '/specialties', label: '特产' },
  { path: '/attraction', label: '景区' }
];

const handleMenuClick = (path) => { router.push(path); };

// 衢州介绍数据
const quzhouIntroduction = {
  title: "衢州——南孔圣地，衢州有礼",
  subtitle: "一座兼具历史底蕴与生态之美的城市",
  content: "衢州，地处浙闽赣皖四省边际，是国家历史文化名城，自古为 “四省通衢”，作为 “南孔圣地”，这里有南宗孔氏家庙，与曲阜北宗呼应，被誉为 “东南阙里”，是儒家文化南传的重要枢纽。",
  features: ["国家历史文化名城", "中国优秀旅游城市", "国家森林城市", "国家园林城市", "南孔圣地·衢州有礼"],
  highlights: [
    { title: "文化名片", desc: "孔氏南宗家庙、水亭门历史文化街区" },
    { title: "自然景观", desc: "江郎山（世界自然遗产）、钱江源国家公园" },
    { title: "特色美食", desc: "衢州三头一掌、龙游发糕、常山贡面" }
  ]
};
</script>

<template>
  <el-container direction="vertical" class="layout-container">
    
    <el-header class="floating-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-outer-container">
        
        <div class="nav-content">
          
          <el-menu mode="horizontal" class="nav-menu" active-text-color="#ffffff" background-color="transparent"
            text-color="#e0e0e0" :default-active="currentPath" :ellipsis="false">
            
            <el-menu-item v-for="(item, i) in menuItems" :key="i" @click="handleMenuClick(item.path)"
              class="nav-menu-item main-nav-item">
              <span class="nav-text">{{ item.label }}</span>
              <div class="nav-indicator"></div>
            </el-menu-item>

          </el-menu>

          <div class="login-corner">
            
            <div v-if="!isLogin" class="login-capsule" @click="goToLogin">
              <el-icon class="login-icon"><User /></el-icon>
              <span class="login-label">登录</span>
            </div>

            <el-dropdown v-else trigger="click">
              <div class="user-dropdown-link">
                <el-avatar :size="32" class="nav-avatar">
                  {{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}
                </el-avatar>
                <el-icon class="dropdown-icon"><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="custom-dropdown">
                  <div class="dropdown-header">你好，{{ userInfo.username }}</div>
                  
                  <el-dropdown-item @click="router.push('/user')">
                    <el-icon><UserFilled /></el-icon>个人中心
                  </el-dropdown-item>
                  
                  <el-dropdown-item @click="openPassDialog">
                    <el-icon><Lock /></el-icon>修改密码
                  </el-dropdown-item>
                  
                  <el-dropdown-item divided @click="handleLogout" style="color: #f56c6c;">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

        </div>
      </div>
    </el-header>

    <el-main :class="{ 'home-content': currentPath === '/index', 'other-content': currentPath !== '/index' }">
      
      <template v-if="currentPath === '/index'">
        <div class="carousel-container">
          <el-carousel :height="screenWidth >= 1200 ? '750px' : '500px'"
            autoplay interval="6000" indicator-position="none" class="carousel" arrow="hover">
            <el-carousel-item v-for="(item, i) in carouselImages" :key="i">
              <div class="img-mask"></div>
              <img :src="item.url" :alt="item.alt" class="carousel-img">
            </el-carousel-item>
          </el-carousel>
          <div class="hero-text">
            <h1>南孔圣地 · 衢州有礼</h1>
            <p>Exploring the Beauty of Quzhou</p>
          </div>
        </div>

        <div class="introduction-section">
          <div class="introduction-wrapper">
            <div class="intro-header">
              <h2 class="intro-title">{{ quzhouIntroduction.title }}</h2>
              <p class="intro-subtitle">{{ quzhouIntroduction.subtitle }}</p>
            </div>
            <ElRow :gutter="40" class="intro-content-row">
              <ElCol :xs="24" :md="16" class="text-col">
                <div class="intro-text-card">
                  <p class="intro-text">{{ quzhouIntroduction.content }}</p>
                </div>
              </ElCol>
              <ElCol :xs="24" :md="8" class="highlight-col">
                <div class="intro-highlight-card">
                  <h3 class="highlight-title">城市亮点</h3>
                  <div class="highlight-list">
                    <div class="highlight-item" v-for="(item, i) in quzhouIntroduction.highlights" :key="i">
                      <span class="highlight-dot"></span>
                      <div>
                        <span class="highlight-item-title">{{ item.title }}</span>
                        <div class="highlight-item-desc">{{ item.desc }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </ElCol>
            </ElRow>
            <div class="features-container">
              <div class="feature-item" v-for="(feature, index) in quzhouIntroduction.features" :key="index">
                {{ feature }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <router-view />
      </template>
    </el-main>

    <el-dialog v-model="passDialogVisible" title="修改密码" width="450px" :close-on-click-modal="false" center destroy-on-close class="custom-dialog">
      <el-form ref="passFormRef" :model="passForm" :rules="passRules" label-width="85px" style="padding-right: 20px; padding-top: 10px;">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passForm.oldPassword" type="password" show-password placeholder="请输入当前使用的密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passForm.newPassword" type="password" show-password placeholder="请输入新密码（6-20位）" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPass" :loading="passLoading">确认修改</el-button>
        </span>
      </template>
    </el-dialog>

  </el-container>
</template>

<style scoped>
/* 全局基础样式 */
.layout-container { min-height: 100vh; background-color: #f9fbf8; font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif; margin: 0; padding: 0; }

/* ------------------ 导航栏核心样式 ------------------ */
.floating-nav { 
  position: fixed !important; top: 0; left: 0; right: 0; 
  z-index: 2000 !important; padding: 0 !important; margin: 0; 
  height: 70px; 
  display: flex; align-items: center; justify-content: center; 
  background-color: transparent !important; 
  transition: all 0.4s ease;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
}

.scrolled { 
  background: rgba(26, 94, 56, 0.95) !important; 
  backdrop-filter: blur(12px); 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
  height: 64px; 
}

.nav-outer-container { width: 100%; padding: 0 30px; box-sizing: border-box; }
.nav-content { 
  max-width: 1400px; margin: 0 auto; width: 100%; height: 100%;
  position: relative; 
  display: flex; align-items: center; justify-content: center;
}

/* 菜单区域 */
.nav-menu { 
  width: 100%; height: 100%; border-bottom: none !important; 
  display: flex; justify-content: center; 
  background: transparent !important;
}

.main-nav-item {
  flex: 1; max-width: 180px; 
  display: flex; justify-content: center; align-items: center;
  padding: 0 !important; height: 100%; cursor: pointer;
  background: transparent !important; position: relative;
}
.main-nav-item:hover { background-color: transparent !important; }

.nav-text { 
  font-size: 17px; font-weight: 500; color: rgba(255,255,255,0.9); 
  letter-spacing: 1.5px; transition: all 0.3s; 
  text-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.main-nav-item:hover .nav-text { 
  color: #fff; transform: translateY(-2px); 
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
.main-nav-item.is-active .nav-text { font-weight: 700; color: #fff; }

.nav-indicator {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  width: 0; height: 3px; background-color: #fff; border-radius: 2px;
  transition: width 0.3s ease; opacity: 0; 
  box-shadow: 0 0 8px rgba(255,255,255,0.8);
}
.main-nav-item.is-active .nav-indicator,
.main-nav-item:hover .nav-indicator { width: 28px; opacity: 1; }

/* ------------------ 右侧登录角落 ------------------ */
.login-corner {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%); z-index: 2001;
}

.login-capsule {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}
.login-capsule:hover {
  background: #ffffff;
  border-color: #ffffff;
  transform: scale(1.05);
}
.login-icon { color: #fff; font-size: 16px; transition: color 0.3s; }
.login-label { color: #fff; font-size: 14px; font-weight: 500; transition: color 0.3s; }
.login-capsule:hover .login-icon, .login-capsule:hover .login-label { color: #1a5e38; }

.user-dropdown-link { display: flex; align-items: center; cursor: pointer; transition: opacity 0.3s; }
.user-dropdown-link:hover { opacity: 0.9; }
.nav-avatar { background-color: #f0f7f2; color: #1a5e38; font-weight: bold; border: 2px solid rgba(255,255,255,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.dropdown-icon { color: white; margin-left: 6px; font-size: 12px; opacity: 0.8; }
.dropdown-header { padding: 8px 16px; font-size: 12px; color: #999; border-bottom: 1px solid #eee; margin-bottom: 5px; }

/* ------------------ 主内容区域 ------------------ */
.main-content { padding: 0; margin: 0; }
.home-content { padding-top: 0; }
.other-content { width: 100%; max-width: 1200px; margin: 0 auto; padding: 100px 20px 40px; min-height: 80vh; }

.carousel-container { position: relative; width: 100%; margin-top: 0 !important; }
.carousel { width: 100%; }
.carousel-img { width: 100%; height: 100%; object-fit: cover; transition: transform 8s ease; }
.el-carousel__item.is-active .carousel-img { transform: scale(1.05); }
.img-mask {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%);
  pointer-events: none;
}
.hero-text {
  position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
  text-align: center; color: #fff; text-shadow: 0 4px 12px rgba(0,0,0,0.3); pointer-events: none; z-index: 10;
}
.hero-text h1 { font-size: 3.5rem; margin-bottom: 10px; font-weight: 700; letter-spacing: 6px; font-family: "KaiTi", serif; }
.hero-text p { font-size: 1.2rem; font-weight: 300; letter-spacing: 3px; opacity: 0.9; text-transform: uppercase; }

/* 介绍区域 */
.introduction-section { background-color: #ffffff; padding: 80px 20px 100px; position: relative; z-index: 5; margin-top: -1px; }
.introduction-wrapper { width: 100%; max-width: 1200px; margin: 0 auto; }
.intro-header { text-align: center; margin-bottom: 60px; }
.intro-title { font-size: 2.4rem; color: #1a5e38; margin-bottom: 15px; font-weight: 700; letter-spacing: 2px; }
.intro-subtitle { font-size: 1.1rem; color: #666; font-weight: 300; letter-spacing: 1px; }

/* 卡片美化 */
.intro-text-card {
  border: none !important;
  background: linear-gradient(135deg, #ffffff 0%, #f4fcf6 100%);
  border-radius: 12px !important;
  padding: 40px 35px; height: 100%;
  position: relative; overflow: hidden;
  box-shadow: 0 10px 25px rgba(26, 94, 56, 0.05);
  transition: all 0.4s ease;
}
.intro-text-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(26, 94, 56, 0.12); }
.intro-text-card::after { content: ""; position: absolute; top: 30px; bottom: 30px; left: 0; width: 5px; background-color: #1a5e38; border-radius: 0 4px 4px 0; opacity: 0.8; }
.intro-text-card::before { content: "礼"; position: absolute; right: -10px; bottom: -40px; font-size: 180px; font-family: "KaiTi", "STKaiti", serif; color: #1a5e38; opacity: 0.07; z-index: 0; pointer-events: none; transform: rotate(-10deg); }
.intro-text { position: relative; z-index: 1; font-size: 1.05rem; line-height: 2.2; color: #2c3e50; text-align: justify; text-indent: 2em; letter-spacing: 1px; }

.intro-highlight-card { background: #f9fbf8; padding: 30px; border-radius: 12px; border: 1px solid #eef2ed; height: 100%; transition: all 0.3s; }
.intro-highlight-card:hover { border-color: #1a5e38; background: #fff; }
.highlight-title { font-size: 1.2rem; color: #1a5e38; margin-bottom: 25px; padding-bottom: 12px; border-bottom: 2px solid #e8f5e9; letter-spacing: 1px; }
.highlight-list { display: flex; flex-direction: column; gap: 20px; }
.highlight-item { display: flex; gap: 12px; align-items: flex-start; }
.highlight-dot { width: 8px; height: 8px; background: #1a5e38; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }
.highlight-item-title { font-weight: 600; color: #333; font-size: 1rem; display: block; margin-bottom: 4px; }
.highlight-item-desc { font-size: 0.9rem; color: #666; line-height: 1.5; }

/* 修复标签遮挡 */
.intro-content-row { margin-bottom: 60px; width: 100%; max-width: 1400px; margin-left: auto; margin-right: auto; position: relative; z-index: 2; }
.features-container { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-top: 40px; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 20px 10px; position: relative; z-index: 10; clear: both; }
.feature-item { background-color: #ffffff; color: #5c7a63; border: 1px solid #e0e9e3; padding: 10px 24px; border-radius: 50px; font-size: 0.95rem; font-weight: 500; letter-spacing: 0.5px; cursor: default; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03); }
.feature-item:hover { background-color: #1a5e38; color: #ffffff; border-color: #1a5e38; transform: translateY(-3px); box-shadow: 0 8px 15px rgba(26, 94, 56, 0.25); }

/* 弹窗样式调整 */
:deep(.custom-dialog) { border-radius: 12px; overflow: hidden; }
:deep(.el-button--primary) { background-color: #1a5e38; border-color: #1a5e38; }
:deep(.el-button--primary:hover) { background-color: #2a7d4a; border-color: #2a7d4a; }

@media (max-width: 768px) {
  .nav-menu { padding: 0; }
  .login-label { display: none; }
  .hero-text h1 { font-size: 2rem; }
  .intro-text-card { padding: 25px; }
  .intro-content-row { margin-bottom: 40px; }
  .features-container { margin-top: 20px; gap: 10px; }
  .feature-item { font-size: 0.85rem; padding: 8px 16px; }
}
</style>