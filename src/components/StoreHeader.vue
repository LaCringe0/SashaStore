<script setup lang="ts">
defineProps<{
  cartCount: number
  currentBillEur: number
}>()

const emit = defineEmits<{
  (e: 'open-cart'): void
  (e: 'open-builder'): void
}>()
</script>

<template>
  <header class="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-rose-100 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <!-- Логотип -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-xl shadow-sm">
          ⚖️
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            Магазин Претензий
          </h1>
          <p class="text-xs text-slate-500">Система учёта мужских косяков</p>
        </div>
      </div>

      <!-- Кнопки и текущий счёт -->
      <div class="flex items-center gap-2.5">
        <button
          @click="emit('open-builder')"
          class="hidden sm:flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-full text-xs font-bold transition active:scale-95"
        >
          <span>⚡</span>
          <span>Конструктор претензии</span>
        </button>

        <!-- Счётчик в евро -->
        <div class="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span class="text-xs text-slate-500">Натикало:</span>
          <span class="text-sm font-extrabold text-emerald-600">
            €{{ currentBillEur.toFixed(2) }}
          </span>
        </div>

        <!-- Кнопка корзины -->
        <button
          @click="emit('open-cart')"
          class="relative flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-4 py-2 rounded-full text-sm font-semibold transition shadow-md"
        >
          <span>🧾 Выставить счёт</span>
          <span
            v-if="cartCount > 0"
            class="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>