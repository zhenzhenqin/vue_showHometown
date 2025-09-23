<script setup>
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElCarousel,
  ElCarouselItem,
  ElMenu,
  ElMenuItem,
  ElRow,
  ElCol,
  ElCard
} from 'element-plus';
import {
  HomeFilled,
  Reading,
  ShoppingBag,
  Location,
  UserFilled
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';

const router = useRouter();  //创建路由实例
const screenWidth = ref(window.innerWidth); //窗口宽度（用于适配）
const currentPath = ref(router.currentRoute.value.path); //当前的路径
const isScrolled = ref(false); //判断页面的滚动，当滚动时，改变导航栏样式

// 监听路由变化
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    currentPath.value = newPath; //更改当前路径
    //不是首页，则无需改变导航栏样式
    if (newPath !== '/index') {
      isScrolled.value = true;
    } else {
      isScrolled.value = window.scrollY > 30;
    }
  },
  { immediate: true } //初始化后立即判断
);

// 监听窗口大小+滚动
//根据滚动距离判断是否更新isScrolled
onMounted(() => {
  const handleResize = () => {
    screenWidth.value = window.innerWidth;
  };
  window.addEventListener('resize', handleResize);

  const handleScroll = () => {
    if (currentPath.value === '/index') {
      isScrolled.value = window.scrollY > 30; //30px改变导航栏样式
    }
  };
  window.addEventListener('scroll', handleScroll);

  //切换页面时移除监听
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

// 导航菜单
const menuItems = [
  { path: '/index', icon: HomeFilled, label: '首页' },
  { path: '/culture', icon: Reading, label: '文化' },
  { path: '/specialties', icon: ShoppingBag, label: '特产' },
  { path: '/attraction', icon: Location, label: '景区' },
  { path: '/user', icon: UserFilled, label: '个人信息' }
];

// 菜单跳转
const handleMenuClick = (path) => {
  router.push(path);
};

// 衢州介绍内容
const quzhouIntroduction = {
  title: "衢州——南孔圣地，衢州有礼",
  subtitle: "一座兼具历史底蕴与生态之美的城市",
  content: "衢州，地处浙闽赣皖四省边际，是国家历史文化名城，自古为 “四省通衢”，作为 “南孔圣地”，这里有南宗孔氏家庙，与曲阜北宗呼应，被誉为 “东南阙里”，是儒家文化南传的重要枢纽，自然景观奇绝：世界自然遗产江郎山 “三爿石” 雄奇，烂柯山承载围棋文化，钱江源林茂泉清，龙游石窟、廿八都古镇更添神秘，美食独具风味，“三头一掌”、龙游发糕、开化清水鱼等广受喜爱，美食独具风味，“三头一掌”、龙游发糕、开化清水鱼等广受喜爱。",
  //特色
  features: [
    "国家历史文化名城",
    "中国优秀旅游城市",
    "国家森林城市",
    "国家园林城市",
    "南孔圣地·衢州有礼"
  ],
  //亮点
  highlights: [
    { title: "文化名片", desc: "孔氏南宗家庙、水亭门历史文化街区" },
    { title: "自然景观", desc: "江郎山（世界自然遗产）、钱江源国家公园" },
    { title: "特色美食", desc: "衢州三头一掌、龙游发糕、常山贡面" }
  ]
};
</script>

<template>
  <!-- Elheader导航栏 + Elmain主要内容  垂直布局 + 浮动导航栏 -->
  <el-container direction="vertical" class="layout-container">

    <!-- 全局导航栏 -->
    <el-header class="floating-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-outer-container">
        <div class="nav-menu-container">
          <el-menu mode="horizontal" class="nav-menu" active-text-color="#ffffff" background-color="transparent"
            text-color="#ffffff" :default-active="currentPath" style="border-bottom: none; margin: 0; padding: 0;">
            <el-menu-item v-for="(item, i) in menuItems" :key="i" @click="handleMenuClick(item.path)"
              class="nav-menu-item" style="padding: 0; margin: 0;">
              <component :is="item.icon" class="nav-icon" />
              <span class="nav-text">{{ item.label }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main :class="{
      'home-content': currentPath === '/index',
      'other-content': currentPath !== '/index'
    }">
      <!-- 首页专属内容 使用一个轮播图轮播图片-->
      <template v-if="currentPath === '/index'">
        <!-- 轮播图 -->
        <div class="carousel-container">
          <el-carousel
            :height="screenWidth >= 1200 ? '700px' : screenWidth >= 992 ? '600px' : screenWidth >= 768 ? '500px' : '350px'"
            autoplay interval="6000" indicator-position="bottom" class="carousel"
            :indicator-class="['carousel-indicator']">
            <el-carousel-item v-for="(item, i) in carouselImages" :key="i">
              <img :src="item.url" :alt="item.alt" class="carousel-img">
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 衢州介绍 -->
        <div class="introduction-section">
          <div class="introduction-wrapper">
            <!-- 标题区 -->
            <div class="intro-header">
              <h2 class="intro-title">{{ quzhouIntroduction.title }}</h2>
              <p class="intro-subtitle">{{ quzhouIntroduction.subtitle }}</p>
            </div>

            <!-- 卡片内容区 栅格布局 Elrow + Elcol -->
            <ElRow :gutter="20" class="intro-content-row">
              <ElCol :xs="24" :md="16" :lg="18" class="text-col">
                <ElCard class="intro-text-card">
                  <p class="intro-text">{{ quzhouIntroduction.content }}</p>
                </ElCard>
              </ElCol>
              <ElCol :xs="24" :md="8" :lg="6" class="highlight-col">
                <ElCard class="intro-highlight-card">
                  <h3 class="highlight-title">城市亮点</h3>
                  <div class="highlight-list">
                    <div class="highlight-item" v-for="(item, i) in quzhouIntroduction.highlights" :key="i">
                      <span class="highlight-icon">★</span>
                      <div>
                        <span class="highlight-item-title">{{ item.title }}：</span>
                        <span class="highlight-item-desc">{{ item.desc }}</span>
                      </div>
                    </div>
                  </div>
                </ElCard>
              </ElCol>
            </ElRow>

            <!-- 特色标签区-->
            <div class="features-container" style="position: relative; z-index: 10; overflow: visible;">
              <div class="feature-item" v-for="(feature, index) in quzhouIntroduction.features" :key="index">
                {{ feature }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 非首页内容（路由出口）
       *导航栏
         -首页
         -（路由出口）其他页面
      -->
      <template v-else>
        <router-view />
      </template>
    </el-main>
  </el-container>
</template>

<style scoped>
/* 全局基础样式 */
.layout-container {
  min-height: 100vh;
  background-color: #f9fbf8;
  font-size: 16px;
  margin: 0;
  padding: 0;
}

/* 导航栏样式 */
.floating-nav {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000 !important;
  padding: 0 !important;
  margin: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent !important;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scrolled {
  background-color: rgba(26, 94, 56, 0.98) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.nav-outer-container {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.nav-menu-container {
  max-width: 1200px;
  margin: 0 auto;
}

.nav-menu {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center;
  width: 100% !important;
  height: 72px;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px !important;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 6px;
}

.nav-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.nav-icon {
  margin-right: 8px;
  font-size: 18px;
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff !important;
}

/* 主内容区 */
.main-content {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* 首页内容 */
.home-content {
  width: 100%;
  padding-top: 0;
}

/* 轮播图 */
.carousel-container {
  width: 100%;
  margin-top: 0 !important;
}

.carousel {
  width: 100%;
  overflow: hidden;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
}

.carousel-indicator {
  bottom: 25px !important;
  display: flex !important;
  justify-content: center !important;
  z-index: 5;
  /* 低于特色标签，避免遮挡 */
}

.carousel-indicator .el-carousel__indicator-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  margin: 0 8px !important;
}

.carousel-indicator .el-carousel__indicator.is-active .el-carousel__indicator-btn {
  background-color: #ffffff;
  width: 36px;
  border-radius: 6px;
}

/* 介绍区域：关键修复特色标签 */
.introduction-section {
  background-color: #ffffff;
  padding: 40px 15px 50px;
  /* 增加底部padding，确保标签不被截断 */
  box-sizing: border-box;
  margin-top: -1px;
  position: relative;
  z-index: 5;
  /* 确保整体介绍区在轮播图上方 */
}

.introduction-wrapper {
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

.intro-header {
  text-align: center;
  margin-bottom: 25px;
}

.intro-title {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  color: #1a5e38;
  margin-bottom: 8px;
  font-weight: 700;
}

.intro-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  color: #666;
}

/* 卡片内容行 */
.intro-content-row {
  margin-bottom: 30px;
  /* 增加卡片到标签的间距，避免挤压 */
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.intro-text-card {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px !important;
  padding: 20px;
  height: 100%;
}

.intro-highlight-card {
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px !important;
  padding: 20px;
  background-color: #f8faf9;
  height: 100%;
}

.intro-text {
  font-size: clamp(0.95rem, 1.2vw, 1rem);
  line-height: 1.7;
  color: #333;
  margin: 0;
}

.highlight-title {
  font-size: clamp(1rem, 1.5vw, 1.1rem);
  color: #1a5e38;
  margin-bottom: 15px;
  font-weight: 600;
}

.highlight-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.highlight-icon {
  color: #1a5e38;
  font-size: 18px;
  margin-top: 2px;
}

.highlight-item-title {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.highlight-item-desc {
  color: #666;
  font-size: 0.9rem;
}

/* 特色标签区：核心修复样式 */
.features-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  /* 适当增大间距，避免拥挤 */
  justify-content: center;
  margin-top: 15px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 10px 0;
  /* 增加内边距，确保内容不贴边 */
  /* 关键：确保不被覆盖 */
  position: relative;
  z-index: 10;
  /* 高于其他元素，避免被遮挡 */
  overflow: visible;
  /* 禁止溢出隐藏，确保换行标签显示 */
}

.feature-item {
  background-color: #f0f7f2;
  color: #1a5e38;
  padding: 12px 20px;
  /* 增大标签内边距，更醒目 */
  border-radius: 30px;
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  /* 确保标签不被挤压 */
  flex-shrink: 0;
  white-space: nowrap;
}

.feature-item:hover {
  background-color: #ffffff;
  color: #1a5e38;
  border-color: #1a5e38;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(26, 94, 56, 0.1);
}

/* 非首页内容 */
.other-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 92px 20px 30px;
  box-sizing: border-box;
  min-height: calc(100vh - 72px);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .nav-menu-container {
    max-width: 900px;
  }

  .intro-content-row {
    max-width: 95%;
  }
}

@media (max-width: 768px) {
  .nav-text {
    display: none;
  }

  .nav-icon {
    margin-right: 0;
    font-size: 20px;
  }

  .nav-menu-item {
    padding: 12px 16px !important;
  }

  .floating-nav {
    height: 60px;
  }

  .nav-menu {
    height: 60px;
  }

  .carousel-img {
    filter: brightness(0.8);
  }

  .el-carousel {
    height: 400px !important;
  }

  .other-content {
    padding-top: 80px;
  }

  /* 小屏特色标签：增加换行空间 */
  .features-container {
    gap: 10px;
    padding: 10px 15px;
  }
}

@media (max-width: 576px) {
  .nav-menu-item {
    padding: 10px 12px !important;
  }

  .nav-icon {
    font-size: 18px;
  }

  .el-carousel {
    height: 300px !important;
  }

  .introduction-section {
    padding: 30px 10px 40px;
  }

  /* 超小屏特色标签：垂直排列时确保显示 */
  .features-container {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .feature-item {
    white-space: normal;
    text-align: center;
  }
}
</style>