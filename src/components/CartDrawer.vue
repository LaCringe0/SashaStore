<script setup lang="ts">
import type { CartItem, ApologyOption, Complaint } from '../types/store'
import ApologySelector from './ApologySelector.vue'

defineProps<{
  isOpen: boolean
  cart: CartItem[]
  apologyOptions: ApologyOption[]
  selectedApologyIds: string[]
  complaintsSubtotal: number
  apologiesSubtotal: number
  totalEur: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add', item: Complaint): void
  (e: 'decrease', id: number): void
  (e: 'toggle-apology', id: string): void
  (e: 'checkout'): void
}>()
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end"
    @click.self="emit('close')"
  >
    <div class="bg-white w-full max-w-md h-full p-5 flex flex-col justify-between shadow-2xl">
      <!-- Верхняя часть -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-lg font-extrabold text-slate-800">🧾 Досье и санкции</h3>
          <p class="text-xs text-slate-400">Формирование официального счёта парню</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
      </div>

      <!-- Пустая корзина -->
      <div v-if="cart.length === 0" class="py-16 text-center space-y-3">
        <span class="text-5xl block">😇</span>
        <p class="text-slate-600 font-bold text-sm">В досье пока пусто!</p>
        <p class="text-slate-400 text-xs max-w-xs mx-auto">
          Неужели он сегодня вёл себя идеально? Добавь хотя бы одну претензию для профилактики.
        </p>
      </div>

      <!-- Список претензий + выбор извинений -->
      <div v-else class="my-4 space-y-5 overflow-y-auto pr-1 flex-1">
        <!-- Выбранные претензии -->
        <div class="space-y-2.5">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            📌 Зафиксированные нарушения ({{ cart.length }})
          </h4>

          <div
            v-for="item in cart"
            :key="item.complaint.id"
            class="flex items-center justify-between bg-rose-50/60 border border-rose-100 p-3 rounded-2xl gap-2"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">{{ item.complaint.emoji }}</span>
              <div>
                <h5 class="text-xs font-bold text-slate-800 leading-snug">
                  {{ item.complaint.title }}
                </h5>
                <span class="text-xs font-extrabold text-rose-600">
                  €{{ (item.complaint.priceEur * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200 shrink-0">
              <button
                @click="emit('decrease', item.complaint.id)"
                class="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-rose-600 font-bold"
              >
                −
              </button>
              <span class="text-xs font-bold w-4 text-center">{{ item.quantity }}</span>
              <button
                @click="emit('add', item.complaint)"
                class="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-rose-600 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Система извинений -->
        <ApologySelector
          :options="apologyOptions"
          :selected-ids="selectedApologyIds"
          @toggle="id => emit('toggle-apology', id)"
        />
      </div>

      <!-- Итоговый блок -->
      <div v-if="cart.length > 0" class="pt-3 border-t border-slate-100 space-y-3">
        <div class="space-y-1 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Сумма по претензиям:</span>
            <span>€{{ complaintsSubtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-purple-600 font-medium">
            <span>Тариф за извинения:</span>
            <span>+€{{ apologiesSubtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
            <span>Итого к оплате:</span>
            <span class="text-emerald-600">€{{ totalEur.toFixed(2) }}</span>
          </div>
        </div>

        <button
          @click="emit('checkout')"
          class="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-sm"
        >
          💶 Выписать официальный евро-чек
        </button>
      </div>
    </div>
  </div>
</template>