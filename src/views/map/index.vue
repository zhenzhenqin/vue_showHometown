<template>
  <div class="explorer-map-container" v-loading="loading" element-loading-text="正在加载地图数据...">
    <div id="tour-map" class="map-view"></div>

    <div class="compass-control" @click="flyToMyLocation" title="回到我的位置">
      <div class="compass-icon">
        <span class="needle">🧭</span>
      </div>
    </div>

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
let myLocationMarker = null 
let myLocationPoint = null  
let drivingRoute = null // 用于存储路线规划实例

// WGS84 转 BD09
const wgs84ToBd09 = (lng, lat) => {
  const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_pi);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_pi);
  const bd_lng = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  return { lng: bd_lng, lat: bd_lat };
}

const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value
}

const formatLocation = (loc) => {
  return loc && loc.length > 6 ? loc.substring(0, 6) + '...' : loc
}

const handleImgError = (e) => {
  e.target.src = '/images/quzhou.jpg'
}

// 初始化地图
const initMap = () => {
  if (typeof BMapGL === 'undefined') {
    ElMessage.error('地图资源加载失败，请检查网络或刷新页面')
    return
  }

  try {
    mapInstance = new BMapGL.Map('tour-map')
    const centerPoint = new BMapGL.Point(118.87263, 28.941708)
    mapInstance.centerAndZoom(centerPoint, 11) 
    mapInstance.enableScrollWheelZoom(true)    
    mapInstance.setTilt(40)                    

    locateUser()

  } catch (e) {
    console.error("地图初始化失败", e)
  }
}

//获取用户位置并标记
const locateUser = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const rawLng = position.coords.longitude;
        const rawLat = position.coords.latitude;
        const bdPoint = wgs84ToBd09(rawLng, rawLat);
        myLocationPoint = new BMapGL.Point(bdPoint.lng, bdPoint.lat);

        if (myLocationMarker) {
          mapInstance.removeOverlay(myLocationMarker);
        }
        
        //  核心修改：使用自定义 HTML 图标创建定位点
        const myIconHtml = `
          <div class="my-location-marker">
            <div class="pulse-ring"></div>
            <div class="center-point"></div>
          </div>
        `;
        
        // 创建自定义覆盖物
        function MyLocationOverlay(point) {
            this._point = point;
        }
        MyLocationOverlay.prototype = new BMapGL.Overlay();
        MyLocationOverlay.prototype.initialize = function(map) {
            this._map = map;
            var div = this._div = document.createElement("div");
            div.style.position = "absolute";
            div.style.zIndex = BMapGL.Overlay.getZIndex(this._point.lat);
            div.innerHTML = myIconHtml;
            map.getPanes().markerPane.appendChild(div);
            return div;
        }
        MyLocationOverlay.prototype.draw = function() {
            var map = this._map;
            var pixel = map.pointToOverlayPixel(this._point);
            // 调整偏移量，使图标中心对准坐标点
            this._div.style.left = pixel.x - 20 + "px";
            this._div.style.top  = pixel.y - 20 + "px";
        }

        myLocationMarker = new MyLocationOverlay(myLocationPoint);
        mapInstance.addOverlay(myLocationMarker);
        
        console.log("定位成功:", bdPoint);
      },
      (error) => { console.warn("定位失败:", error.message); },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
}

//  罗盘点击
const flyToMyLocation = () => {
  if (myLocationPoint) {
    mapInstance.flyTo(myLocationPoint, 16);
    ElMessage.success("已回到当前位置");
  } else {
    ElMessage.warning("正在获取位置，请稍后...");
    locateUser();
  }
}

//  开始导航规划
const startNavigation = (destinationPoint) => {
  if (!myLocationPoint) {
    ElMessage.warning("无法获取您的当前位置，请确保已授予定位权限。");
    locateUser(); // 尝试重新定位
    return;
  }

  // 清除之前的路线规划
  if (drivingRoute) {
    drivingRoute.clearResults();
  }

  ElMessage.info("正在为您规划最佳路线...");

  // 创建驾车实例
  drivingRoute = new BMapGL.DrivingRoute(mapInstance, {
    renderOptions: { 
      map: mapInstance, 
      autoViewport: true, // 自动调整视野以包含整个路线
      enableDragging: true // 允许拖拽路线
    },
    onSearchComplete: function(results){
      if (drivingRoute.getStatus() != BMAP_STATUS_SUCCESS){
        ElMessage.error("路线规划失败，请稍后再试。");
      } else {
        ElMessage.success("路线规划完成！");
      }
    }
  });

  // 发起规划
  drivingRoute.search(myLocationPoint, destinationPoint);
  
  // 关闭当前信息窗口
  mapInstance.closeInfoWindow();
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getAttraction()
    if (res.code === 1 && res.data) {
      attractionList.value = res.data
      const hasCoords = []; const noCoords = [];
      attractionList.value.forEach(item => {
        if (item.longitude && item.latitude) { hasCoords.push(item) } else { noCoords.push(item) }
      })
      hasCoords.forEach(item => addCreativeMarker(item))
      if (noCoords.length > 0) { processQueueSlowly(noCoords) }
    }
  } catch (err) { ElMessage.error('获取景点数据失败') } finally { loading.value = false }
}

const processQueueSlowly = async (list) => {
  for (const item of list) {
    addCreativeMarker(item)
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

const addCreativeMarker = (item) => {
  if (item.longitude && item.latitude) {
    createMarkerLogic(new BMapGL.Point(item.longitude, item.latitude), item)
  } else {
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

  const scoreDisplay = item.score ? Number(item.score).toFixed(1) : '暂无';
  
  // 🔥 核心修改：在信息窗口中增加导航按钮
  // 注意：这里使用全局函数调用，因为 BMapGL 的 InfoWindow 不支持直接绑定 Vue 方法
  const infoHtml = `
    <div style="width: 250px; font-family: sans-serif; overflow: hidden; border-radius: 8px;">
      <div style="height: 130px; position: relative;">
        <img src="${item.image}" onerror="this.src='/images/quzhou.jpg'" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom:0; left:0; right:0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); color:#fff; padding:8px 12px;">
          <h4 style="margin:0; font-size:16px;">${item.name}</h4>
        </div>
      </div>
      <div style="padding: 12px; background: #fff;">
        <div style="color: #666; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center;">
          <span style="margin-right: 4px;">📍</span> ${item.location || '衢州市'}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <div style="color: #ff9800; font-weight:bold; font-size: 14px;">⭐ ${scoreDisplay} 分</div>
          <button onclick="window.callVueNavigate('${point.lng}', '${point.lat}')" 
                  style="background: #409eff; color: #fff; border: none; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; box-shadow: 0 2px 6px rgba(64,158,255,0.3); transition: all 0.2s;">
            <span style="margin-right: 4px;">🚴</span> 去这里
          </button>
        </div>
      </div>
    </div>
  `

  const infoWindow = new BMapGL.InfoWindow(infoHtml, {
    width: 250,
    height: 230,
    title: '',
    enableAutoPan: true,
    offset: new BMapGL.Size(0, -20)
  })

  marker.addEventListener('click', () => {
    mapInstance.openInfoWindow(infoWindow, point)
    currentSpotId.value = item.id
  })
}

const flyToSpot = (item) => {
  currentSpotId.value = item.id
  const target = markers.find(m => m.id === item.id)
  if (target && target.point) { mapInstance.flyTo(target.point, 15) }
  else if (item.longitude && item.latitude) { mapInstance.flyTo(new BMapGL.Point(item.longitude, item.latitude), 15) }
}

// 🔥 将导航方法挂载到全局，供 InfoWindow 调用
window.callVueNavigate = (lng, lat) => {
  const destination = new BMapGL.Point(lng, lat);
  startNavigation(destination);
}

onMounted(() => {
  setTimeout(() => {
    initMap()
    loadData()
  }, 500)
})
</script>

<style scoped>
.explorer-map-container {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh; z-index: 1; background: #eef2f3;
}
.map-view { width: 100%; height: 100%; }

/* 🧭 罗盘控件 */
.compass-control {
  position: absolute; bottom: 40px; right: 40px; width: 56px; height: 56px;
  background: #fff; border-radius: 50%; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 20; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.compass-control:hover { transform: scale(1.1) rotate(15deg); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25); }
.compass-control:active { transform: scale(0.95); }
.compass-icon { font-size: 32px; line-height: 1; user-select: none; }

/* 侧边栏 */
.side-panel {
  position: absolute; top: 85px; left: 20px; width: 320px; max-height: calc(100vh - 110px); 
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px);
  border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 10; display: flex; flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.6); transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.side-panel.collapsed { transform: translateX(-360px); }
.toggle-handle {
  position: absolute; right: -30px; top: 15px; width: 30px; height: 50px;
  background: rgba(255, 255, 255, 0.95); border-radius: 0 8px 8px 0; 
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05); border-left: none; transition: all 0.3s;
}
.toggle-handle:hover { background: #fff; color: #1a5e38; }
.toggle-icon { font-size: 14px; color: #666; user-select: none; }
.panel-header { padding: 15px 20px; border-bottom: 1px solid rgba(0,0,0,0.06); flex-shrink: 0; }
.panel-header h3 { margin: 0; color: #1a5e38; font-size: 18px; font-weight: 700; letter-spacing: 1px; }
.panel-header p { margin: 4px 0 0; color: #999; font-size: 12px; }
.spot-list { flex: 1; overflow-y: auto; padding: 12px; }
.spot-list::-webkit-scrollbar { width: 4px; }
.spot-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
.spot-card {
  display: flex; align-items: center; padding: 10px; margin-bottom: 10px;
  background: #fff; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03); border: 1px solid transparent;
}
.spot-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.spot-card.active { border-color: #1a5e38; background: #f0f9f4; }
.spot-img-box { width: 50px; height: 50px; border-radius: 6px; overflow: hidden; flex-shrink: 0; margin-right: 12px; background: #f0f0f0; }
.spot-img-box img { width: 100%; height: 100%; object-fit: cover; }
.spot-info { flex: 1; overflow: hidden; }
.spot-info h4 { margin: 0 0 4px; font-size: 14px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tags { display: flex; gap: 10px; font-size: 12px; align-items: center; }
.score { color: #ff9800; font-weight: bold; font-family: Arial; }
.location { color: #999; transform: scale(0.9); transform-origin: left center;}
.arrow-icon { color: #ddd; font-size: 12px; padding-left: 5px; transition: transform 0.3s; }
.spot-card:hover .arrow-icon { color: #1a5e38; transform: translateX(3px); }

/* 移动端适配 */
@media (max-width: 768px) {
  .side-panel { top: auto; bottom: 20px; left: 10px; right: 10px; width: auto; max-height: 35vh; }
  .side-panel.collapsed { transform: translateY(110%); }
  .toggle-handle { top: -30px; right: 10px; width: 40px; height: 30px; border-radius: 8px 8px 0 0; border-bottom: none; border-left: 1px solid rgba(0,0,0,0.05); }
  .toggle-icon { transform: rotate(90deg); }
  .compass-control { bottom: 40vh; right: 20px; width: 48px; height: 48px; }
  .compass-icon { font-size: 24px; }
}
</style>

<style>
.my-location-marker {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 中心实心点 */
.center-point {
  width: 16px;
  height: 16px;
  background-color: #409eff;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.6);
  z-index: 2;
}

/* 扩散光环动画 */
.pulse-ring {
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: rgba(64, 158, 255, 0.4);
  border-radius: 50%;
  animation: pulse-animation 2s infinite ease-out;
  z-index: 1;
}

@keyframes pulse-animation {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 优化百度地图信息窗口样式 */
.BMap_bubble_title { display: none !important; }
.BMap_bubble_content { padding: 0 !important; }
.BMap_pop > img { display: none !important; } /* 隐藏默认关闭按钮，可以自己实现 */
.BMap_top, .BMap_center, .BMap_bottom { border: none !important; background: transparent !important; }
</style>