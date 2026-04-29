<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const pointer = ref({ x: 50, y: 50 })
const isMobile = ref(false)

const seededRandom = (seed) => {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const makeStars = (count, seed) => {
  const random = seededRandom(seed)
  return Array.from({ length: count }, (_, index) => {
    const isMilkyWay = random() > 0.42
    const baseX = random() * 100
    const bandY = 76 - baseX * 0.45 + (random() - 0.5) * 34
    const y = isMilkyWay ? Math.max(4, Math.min(96, bandY)) : random() * 100
    const size = isMilkyWay ? 0.9 + random() * 2.2 : 0.6 + random() * 1.8
    const glow = isMilkyWay ? 0.45 + random() * 0.5 : 0.22 + random() * 0.38
    return {
      id: index,
      x: baseX,
      y,
      size,
      opacity: glow,
      hue: random() > 0.82 ? 'cyan' : random() > 0.9 ? 'lime' : 'white',
      depth: 0.35 + random() * 1.35,
      delay: `${-(random() * 4).toFixed(2)}s`
    }
  })
}

const desktopStars = makeStars(150, 3719)
const mobileStars = makeStars(60, 9127)
const stars = computed(() => isMobile.value ? mobileStars : desktopStars)

const fieldStyle = computed(() => {
  const x = (pointer.value.x - 50) / 50
  const y = (pointer.value.y - 50) / 50
  return {
    '--sky-shift-x': `${x * 10}px`,
    '--sky-shift-y': `${y * 7}px`,
    '--cursor-x': `${pointer.value.x}%`,
    '--cursor-y': `${pointer.value.y}%`
  }
})

const getStarStyle = (star) => {
  if (isMobile.value) {
    const color = {
      cyan: 'rgba(0, 229, 255, 0.62)',
      lime: 'rgba(182, 255, 59, 0.52)',
      white: 'rgba(242, 251, 255, 0.68)'
    }[star.hue]

    return {
      left: `${star.x}%`,
      top: `${star.y}%`,
      width: `${Math.max(0.7, star.size * 0.72)}px`,
      height: `${Math.max(0.7, star.size * 0.72)}px`,
      opacity: Math.min(0.72, star.opacity),
      background: color,
      boxShadow: `0 0 5px ${color}`,
      animationDelay: star.delay
    }
  }

  const dx = star.x - pointer.value.x
  const dy = star.y - pointer.value.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const lift = Math.max(0, 1 - distance / 18)
  const color = {
    cyan: 'rgba(0, 229, 255, 0.88)',
    lime: 'rgba(182, 255, 59, 0.78)',
    white: 'rgba(242, 251, 255, 0.86)'
  }[star.hue]

  return {
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    opacity: Math.min(1, star.opacity + lift * 0.5),
    background: color,
    boxShadow: `0 0 ${6 + lift * 16}px ${color}`,
    transform: `translate3d(${(pointer.value.x - 50) * star.depth * -0.045}px, ${(pointer.value.y - 50) * star.depth * -0.035}px, 0) scale(${1 + lift * 0.55})`,
    animationDelay: star.delay
  }
}

const handlePointerMove = (event) => {
  if (isMobile.value) return
  pointer.value = {
    x: (event.clientX / window.innerWidth) * 100,
    y: (event.clientY / window.innerHeight) * 100
  }
}

const handlePointerLeave = () => {
  pointer.value = { x: 50, y: 50 }
}

onMounted(() => {
  isMobile.value = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
  if (!isMobile.value) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
  }
})

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerleave', handlePointerLeave)
})
</script>

<template>
  <div class="starfield" :style="fieldStyle" aria-hidden="true">
    <div class="milky-core"></div>
    <span v-for="star in stars" :key="star.id" class="star" :style="getStarStyle(star)"></span>
    <div class="cursor-aura"></div>
  </div>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  overflow: hidden;
  opacity: 1;
}

[data-theme='light'] .starfield {
  display: none;
}

.milky-core {
  position: absolute;
  left: -18vw;
  top: 14vh;
  width: 138vw;
  height: 48vh;
  transform: translate3d(var(--sky-shift-x), var(--sky-shift-y), 0) rotate(-19deg);
  background:
    radial-gradient(ellipse at 42% 50%, rgba(242, 251, 255, 0.16), transparent 12%),
    radial-gradient(ellipse at 52% 50%, rgba(0, 229, 255, 0.13), transparent 20%),
    radial-gradient(ellipse at 62% 50%, rgba(255, 61, 242, 0.08), transparent 24%),
    linear-gradient(90deg, transparent, rgba(242, 251, 255, 0.08), rgba(0, 229, 255, 0.12), rgba(255, 61, 242, 0.06), transparent);
  filter: blur(18px);
  opacity: 0.86;
}

.star {
  position: absolute;
  border-radius: 999px;
  transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  animation: twinkle 4.8s ease-in-out infinite;
}

.cursor-aura {
  position: absolute;
  left: var(--cursor-x);
  top: var(--cursor-y);
  width: 30rem;
  height: 30rem;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0, 229, 255, 0.12), rgba(255, 61, 242, 0.05) 32%, transparent 62%);
  filter: blur(10px);
  opacity: 0.7;
}

@media (max-width: 768px), (pointer: coarse) {
  .starfield {
    opacity: 0.72;
  }

  .milky-core {
    left: -36vw;
    top: 18vh;
    width: 170vw;
    height: 42vh;
    transform: rotate(-22deg);
    filter: blur(22px);
    opacity: 0.58;
  }

  .star {
    transition: none;
    animation: none;
  }

  .cursor-aura {
    display: none;
  }
}

@keyframes twinkle {
  0%, 100% { filter: brightness(0.82); }
  48% { filter: brightness(1.35); }
}

@media (prefers-reduced-motion: reduce) {
  .star,
  .milky-core,
  .cursor-aura {
    transition: none;
    animation: none;
  }
}
</style>
