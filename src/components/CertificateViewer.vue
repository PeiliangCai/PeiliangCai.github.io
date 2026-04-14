<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye, X } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  pdfUrl: String
})

const isOpen = ref(false)
const canvasRef = ref(null)
const isLoading = ref(false)
let pdfjsLib = null

const openModal = async () => {
  isOpen.value = true
  isLoading.value = true
  
  try {
    // Dynamic import for PDF.js to reduce main bundle size and improve page load speed
    if (!pdfjsLib) {
      pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    }

    // Wait for canvas to be in DOM
    setTimeout(async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = canvasRef.value
        if (!canvas) return
        
        const context = canvas.getContext('2d')
        
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        
        await page.render(renderContext).promise
        addWatermark(context, canvas.width, canvas.height)
      } catch (err) {
        console.error('PDF Render Error:', err)
      } finally {
        isLoading.value = false
      }
    }, 100)
    
  } catch (error) {
    console.error('Error loading PDF.js:', error)
    isLoading.value = false
  }
}

const addWatermark = (ctx, width, height) => {
  ctx.save()
  ctx.rotate(-Math.PI / 4)
  ctx.font = 'bold 24px JetBrains Mono'
  ctx.fillStyle = 'rgba(120, 120, 120, 0.15)'
  ctx.textAlign = 'center'
  
  const text = '仅供 PeiliangCai 求职展示 - 请勿传播'
  for (let i = -width; i < width * 2; i += 300) {
    for (let j = -height; j < height * 2; j += 100) {
      ctx.fillText(text, i, j)
    }
  }
  ctx.restore()
}

const closeModal = () => {
  isOpen.value = false
}

const handleContextMenu = (e) => {
  if (isOpen.value) e.preventDefault()
}

onMounted(() => {
  window.addEventListener('contextmenu', handleContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('contextmenu', handleContextMenu)
})
</script>

<template>
  <div class="cert-item glass" @click="openModal">
    <div class="cert-info">
      <span class="cert-icon">🎓</span>
      <span class="cert-title">{{ title }}</span>
    </div>
    <button class="view-btn">
      <Eye :size="18" />
    </button>
  </div>

  <teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container glass animate-fade-in">
        <header class="modal-header">
          <h3>{{ title }} - 预览模式</h3>
          <button @click="closeModal" class="close-btn"><X :size="20" /></button>
        </header>
        
        <div class="canvas-wrapper" @contextmenu.prevent>
          <div v-if="isLoading" class="loader-box">
             <div class="spinner"></div>
             <span>SECURE RENDERING...</span>
          </div>
          <canvas ref="canvasRef" class="pdf-canvas" v-show="!isLoading"></canvas>
          <div class="security-overlay"></div>
        </div>

        <footer class="modal-footer">
          <p class="warning-text">⚠️ 受到数字水印保护。已禁用打印与右键。</p>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth);
}

.cert-item:hover {
  border-color: var(--accent-primary);
  transform: translateX(10px);
}

.cert-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cert-title {
  font-weight: 500;
  color: var(--text-primary);
}

.view-btn {
  color: var(--text-secondary);
}

.modal-container {
  width: 90%;
  max-width: 800px;
  background: var(--bg-dark);
  border-radius: 16px;
  overflow: hidden;
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--accent-primary);
  font-weight: bold;
  font-family: monospace;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.canvas-wrapper {
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  background: #111;
  padding: 2rem;
}

.pdf-canvas {
  max-width: 100%;
  height: auto;
  user-select: none;
}
</style>
