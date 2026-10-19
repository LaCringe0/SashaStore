<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import type { Complaint, DramaLevel } from '../types/store'

const props = defineProps<{
  item: Complaint
  quantityInCart: number
}>()

const emit = defineEmits<{
  (e: 'add', item: Complaint): void
  (e: 'delete', id: number): void
}>()

const cardRef = ref<HTMLElement | null>(null)
const glareStyle = ref({
  background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0), transparent 70%)',
  opacity: 0
})

// 3D Tilt при движении мыши по карточке
const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  const rotateX = ((y - centerY) / centerY) * -10 // Наклон вверх-вниз
  const rotateY = ((x - centerX) / centerX) * 10  // Наклон влево-вправо

  gsap.to(cardRef.value, {
    rotateX,
    rotateY,
    scale: 1.03,
    transformPerspective: 900,
    duration: 0.3,
    ease: 'power2.out'
  })

  const percentX = Math.round((x / rect.width) * 100)
  const percentY = Math.round((y / rect.height) * 100)
  glareStyle.value = {
    background: `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255, 255, 255, 0.65), transparent 65%)`,
    opacity: 1
  }
}

const handleMouseLeave = () => {
  if (!cardRef.value) return
  gsap.to(cardRef.value, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.6,
    ease: 'elastic.out(1, 0.5)'
  })
  glareStyle.value.opacity = 0
}

// Эффект упругого удара при добавлении в чек
const handleAddClick = () => {
  if (cardRef.value) {
    gsap.fromTo(
      cardRef.value,
      { scale: 0.92 },
      { scale: 1.03, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' }
    )
  }
  emit('add', props.item)
}

const getDramaBadgeClass = (drama: DramaLevel): string => {
  switch (drama) {
    case 'Лёгкий вздох':
      return 'bg-emerald-50/90 text-emerald-700 border-emerald-200'
    case 'Надутые губки':
      return 'bg-amber-50/90 text-amber-700 border-amber-200'
    case 'Скандал':
      return 'bg-rose-50/90 text-rose-700 border-rose-200'
    case 'Оскар 🏆':
      return 'bg-purple-100/90 text-purple-800 border-purple-300 font-bold animate-pulse'
  }
}
</script>

<template>
  <div
    ref="cardRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    style="transform-style: preserve-3d"
    class="bg-white/75 backdrop-blur-xl rounded-3xl p-5 border border-white/80 shadow-lg hover:shadow-2xl transition-shadow flex flex-col justify-between group relative overflow-hidden"
  >
    <!-- Слой голографического блика -->
    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
      :style="glareStyle"
    />

    <!-- Бейдж количества в чеке -->
    <div
      v-if="quantityInCart > 0"
      class="absolute top-3 right-3 z-20 bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md"
    >
      В чеке: {{ quantityInCart }}×
    </div>

    <!-- Кнопка удаления для кастомных -->
    <button
      v-if="item.category === 'Кастомные' && quantityInCart === 0"
      @click.stop="emit('delete', item.id)"
      title="Удалить эту претензию"
      class="absolute top-3 right-3 z-20 text-slate-400 hover:text-rose-500 transition p-1 text-sm rounded-lg hover:bg-rose-50"
    >
      🗑️
    </button>

    <div class="relative z-20" style="transform: translateZ(20px)">
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="text-4xl group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300 inline-block drop-shadow-sm">
          {{ item.emoji }}
        </span>
        <span
          v-if="quantityInCart === 0 && item.category !== 'Кастомные'"
          :class="['text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm', getDramaBadgeClass(item.drama)]"
        >
          {{ item.drama }}
        </span>
      </div>

      <span class="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
        {{ item.category }}
      </span>
      <h3 class="text-base font-extrabold text-slate-800 mt-1 mb-2 leading-snug">
        {{ item.title }}
      </h3>
      <p class="text-xs text-slate-600 leading-relaxed">
        {{ item.description }}
      </p>
    </div>

    <div
      class="relative z-20 pt-4 mt-5 border-t border-rose-100/60 flex items-center justify-between"
      style="transform: translateZ(25px)"
    >
      <div>
        <span class="text-[11px] text-slate-400 block">Штрафной тариф:</span>
        <span class="text-lg font-black text-slate-900">
          €{{ item.priceEur.toFixed(2) }}
        </span>
      </div>

      <button
        @click="handleAddClick"
        class="bg-slate-900 hover:bg-rose-500 text-white active:scale-90 font-bold text-xs px-4 py-2.5 rounded-2xl transition-colors shadow-md"
      >
        + Припомнить
      </button>
    </div>
  </div>
</template>