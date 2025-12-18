<template>
  <div class="explorer-map-container" v-loading="loading">
    <div id="tour-map" class="map-view"></div>

    <div class="side-panel" :class="{ 'collapsed': isCollapsed }">
      
      <div class="toggle-handle" @click="togglePanel" :title="isCollapsed ? '展开列表' : '收起列表'">
        <span class="toggle-icon">{{ isCollapsed ? '👉' : '👈' }}</span>
      </div>

      <div class="panel-header">
        <h3>📍 衢州·云游导览</h3>
        <p>点击列表，开启你的探索之旅</p>
      </div>
      
      <div class="spot-list">
        <div 
          v-for="item in attractionList" 
          :key="item.id" 
          class="spot-card"
          :class="{ active: currentSpotId === item.id }"
          @click="flyToSpot(item)"
        >
          <div class="spot-img-box">
            <img :src="item.image" loading="lazy" @error="handleImgError" />
          </div>
          <div class="spot-info">
            <h4>{{ item.name }}</h4>
            <div class="tags">
              <span class="score">⭐ {{ item.score ? Number(item.score).toFixed(1) : '暂无' }}</span>
              <span class="location">{{ formatLocation(item.location) }}</span>
            </div>
          </div>
          <div class="arrow-icon">➜</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttraction } from '@/api/attraction'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const attractionList = ref([])
const currentSpotId = ref(null)
const isCollapsed = ref(false) 
let mapInstance = null
let markers = [] 

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value
}

const formatLocation = (loc) => {
  return loc && loc.length > 6 ? loc.substring(0, 6) + '...' : loc
}

const handleImgError = (e) => {
  e.target.src = '/images/quzhou.jpg' // 确保你 public/images 下有这个默认图
}

const initMap = () => {
  if (typeof BMapGL === 'undefined') {
    ElMessage.error('地图资源加载失败，请检查网络或刷新页面')
    return
  }

  try {
    mapInstance = new BMapGL.Map('tour-map')
    // 衢州市中心
    const centerPoint = new BMapGL.Point(118.87263, 28.941708)
    
    mapInstance.centerAndZoom(centerPoint, 11)
    mapInstance.enableScrollWheelZoom(true)
    mapInstance.setTilt(40) // 3D视角
  } catch (e) {
    console.error("地图初始化失败", e)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAttraction()
    if (res.code === 1 && res.data) {
      attractionList.value = res.data
      attractionList.value.forEach(item => {
        addCreativeMarker(item)
      })
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('获取景点数据失败')
  } finally {
    loading.value = false
  }
}

const addCreativeMarker = (item) => {
  let point
  if (item.longitude && item.latitude) {
    point = new BMapGL.Point(item.longitude, item.latitude)
    createMarkerLogic(point, item)
  } else {
    // 兜底：地址解析
    const myGeo = new BMapGL.Geocoder()
    myGeo.getPoint('衢州市 ' + (item.location || item.name), (p) => {
      if (p) createMarkerLogic(p, item)
    }, '衢州市')
  }
}

const createMarkerLogic = (point, item) => {
  const marker = new BMapGL.Marker(point)
  mapInstance.addOverlay(marker)
  markers.push({ id: item.id, marker, point })

  // ✨ 修复：弹窗里的评分也展示真实数据
  const scoreDisplay = item.score ? Number(item.score).toFixed(1) : '暂无';

  const infoHtml = `
    <div style="width: 240px; font-family: sans-serif;">
      <div style="height: 120px; border-radius: 6px 6px 0 0; overflow: hidden; position: relative;">
        <img src="${item.image}" onerror="this.src='/images/quzhou.jpg'" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom:0; width:100%; background: rgba(0,0,0,0.5); color:#fff; padding:4px 8px; font-size:14px;">
          ${item.name}
        </div>
      </div>
      <div style="padding: 10px; background: #fff; border-radius: 0 0 6px 6px;">
        <div style="color: #666; font-size: 12px; margin-bottom: 4px;">📍 ${item.location || '衢州市'}</div>
        <div style="color: #ff9800; font-size: 12px;">⭐ 推荐指数: ${scoreDisplay}</div>
      </div>
    </div>
  `

  const infoWindow = new BMapGL.InfoWindow(infoHtml, {
    width: 240,
    height: 190,
    title: '',
    offset: new BMapGL.Size(0, -20)
  })

  marker.addEventListener('click', () => {
    mapInstance.openInfoWindow(infoWindow, point)
    currentSpotId.value = item.id
    mapInstance.panTo(point)
  })
}

const flyToSpot = (item) => {
  currentSpotId.value = item.id
  const target = markers.find(m => m.id === item.id)
  
  if (target && target.point) {
    mapInstance.flyTo(target.point, 15)
  } else if (item.longitude && item.latitude) {
     const p = new BMapGL.Point(item.longitude, item.latitude)
     mapInstance.flyTo(p, 15)
  }
}

onMounted(() => {
  setTimeout(() => {
    initMap()
    loadData()
  }, 500)
})
</script>

<style scoped>
/* ✨ 修复：使用 fixed 定位强行撑满屏幕，解决留白问题 
   同时 z-index 设为 1，确保在导航栏(z-index: 2000)下方
*/
.explorer-map-container {
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1; 
  background: #eef2f3;
}

.map-view {
  width: 100%;
  height: 100%;
}

/* ✨ 修复：侧边栏位置调整
   top: 80px 确保避开顶部的导航栏 (导航栏高度约 70px)
   max-height 计算减去顶部空隙和底部空隙
*/
.side-panel {
  position: absolute;
  top: 85px; 
  left: 20px;
  width: 320px;
  /* 动态计算高度：总高 - 顶部避让 - 底部留白 */
  max-height: calc(100vh - 110px); 
  background: rgba(255, 255, 255, 0.9); /*稍微不透明一点，防止和地图混杂*/
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.side-panel.collapsed {
  transform: translateX(-360px); 
}

/* 按钮位置微调 */
.toggle-handle {
  position: absolute;
  right: -30px; 
  top: 15px; /* 稍微靠上一点 */
  width: 30px;
  height: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0 8px 8px 0; 
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-left: none;
}

.toggle-handle:hover {
  background: #fff;
  color: #1a5e38;
}

.toggle-icon {
  font-size: 14px;
  color: #666;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0; /* 防止头部被压缩 */
}

.panel-header h3 {
  margin: 0;
  color: #1a5e38;
  font-size: 18px;
  font-weight: 700;
}

.panel-header p {
  margin: 4px 0 0;
  color: #999;
  font-size: 12px;
}

.spot-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.spot-list::-webkit-scrollbar { width: 4px; }
.spot-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

.spot-card {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  border: 1px solid transparent;
}

.spot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.spot-card.active {
  border-color: #1a5e38;
  background: #f0f9f4;
}

.spot-img-box {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 12px;
  background: #f0f0f0;
}

.spot-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spot-info {
  flex: 1;
  overflow: hidden;
}

.spot-info h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  display: flex;
  gap: 10px;
  font-size: 12px;
  align-items: center;
}

.score { color: #ff9800; font-weight: bold; font-family: Arial; }
.location { color: #999; transform: scale(0.9); transform-origin: left center;}

.arrow-icon {
  color: #ddd;
  font-size: 12px;
  padding-left: 5px;
}

.spot-card:hover .arrow-icon {
  color: #1a5e38;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .side-panel {
    top: auto;
    bottom: 20px;
    left: 10px;
    right: 10px;
    width: auto;
    max-height: 40vh;
  }
  .toggle-handle {
    top: -30px;
    right: 10px;
    width: 40px;
    height: 30px;
    border-radius: 8px 8px 0 0;
    border-bottom: none;
    border-left: 1px solid #eee;
  }
  .toggle-icon { transform: rotate(90deg); }
}
</style>