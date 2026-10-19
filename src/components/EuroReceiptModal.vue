<script setup lang="ts">
import { ref } from 'vue'
import type { CartItem, ApologyOption } from '../types/store'
import { sendReceiptToTelegram } from '../services/telegram'

const props = defineProps<{
  isOpen: boolean
  orderItems: CartItem[]
  selectedApologies: ApologyOption[]
  nervesTaxEur: number
  finalTotalEur: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isSending = ref(false)
const sendStatus = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const copied = ref(false)

// Отправка в Telegram через бота
const handleSendToTelegram = async () => {
  isSending.value = true
  sendStatus.value = 'idle'
  errorMessage.value = ''

  const result = await sendReceiptToTelegram({
    orderItems: props.orderItems,
    selectedApologies: props.selectedApologies,
    nervesTaxEur: props.nervesTaxEur,
    finalTotalEur: props.finalTotalEur
  })

  isSending.value = false

  if (result.success) {
    sendStatus.value = 'success'
  } else {
    sendStatus.value = 'error'
    errorMessage.value = result.error || 'Не удалось отправить'
  }
}

// Запасное копирование в буфер
const copyReceipt = async () => {
  const dateStr = new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const complaintsText = props.orderItems
    .map(
      (i, idx) =>
        `${idx + 1}. ${i.complaint.emoji} ${i.complaint.title} (x${i.quantity}) — €${(
          i.complaint.priceEur * i.quantity
        ).toFixed(2)}`
    )
    .join('\n')

  const apologiesText =
    props.selectedApologies.length > 0
      ? '\n🤝 ОБЯЗАТЕЛЬНЫЕ ИЗВИНЕНИЯ:\n' +
        props.selectedApologies
          .map(a => `• ${a.emoji} ${a.title} (+€${a.feeEur.toFixed(2)})`)
          .join('\n')
      : ''

  const receiptText =
    `🧾 ФИСКАЛЬНЫЙ ЧЕК ПРЕТЕНЗИЙ\n` +
    `📅 Дата: ${dateStr}\n` +
    `────────────────────\n` +
    `📌 СПИСОК КОСЯКОВ:\n${complaintsText}\n` +
    `${apologiesText}\n` +
    `────────────────────\n` +
    `📈 Налог на нервные клетки (10%): €${props.nervesTaxEur.toFixed(2)}\n` +
    `💶 ИТОГО К ОПЛАТЕ: €${props.finalTotalEur.toFixed(2)}`

  await navigator.clipboard.writeText(receiptText)
  copied.value = true
  setTimeout(() => (copied.value = false), 2500)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-dashed border-slate-300 space-y-4 font-mono">
      <!-- Заголовок чека -->
      <div class="text-center border-b border-dashed border-slate-200 pb-3">
        <span class="text-3xl">💶</span>
        <h3 class="text-base font-black uppercase text-slate-900 mt-1">
          Европейский Кассовый Чек
        </h3>
        <p class="text-[11px] text-slate-400">НДС на женскую драму включён</p>
      </div>

      <!-- Список претензий -->
      <div class="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
        <div class="text-[10px] font-bold text-slate-400 uppercase">Позиции обвинения:</div>
        <div
          v-for="item in orderItems"
          :key="item.complaint.id"
          class="flex justify-between gap-2"
        >
          <span class="text-slate-700">
            {{ item.complaint.emoji }} {{ item.complaint.title }} ×{{ item.quantity }}
          </span>
          <span class="font-bold text-slate-900 shrink-0">
            €{{ (item.complaint.priceEur * item.quantity).toFixed(2) }}
          </span>
        </div>

        <!-- Выбранные извинения -->
        <template v-if="selectedApologies.length > 0">
          <div class="text-[10px] font-bold text-purple-600 uppercase pt-2 border-t border-dashed border-slate-200">
            Пакет извинений:
          </div>
          <div
            v-for="ap in selectedApologies"
            :key="ap.id"
            class="flex justify-between gap-2 text-purple-800"
          >
            <span>{{ ap.emoji }} {{ ap.title }}</span>
            <span class="font-bold shrink-0">+€{{ ap.feeEur.toFixed(2) }}</span>
          </div>
        </template>
      </div>

      <!-- Финансовый итог -->
      <div class="border-t border-dashed border-slate-300 pt-3 space-y-1 text-xs">
        <div class="flex justify-between text-slate-500">
          <span>Сбор за нервные клетки (10%):</span>
          <span>€{{ nervesTaxEur.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-base font-black text-slate-900 pt-1">
          <span>К ОПЛАТЕ:</span>
          <span class="text-emerald-600">€{{ finalTotalEur.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="space-y-2 pt-2 font-sans">
        <!-- Главная кнопка: отправка в Telegram -->
        <button
          @click="handleSendToTelegram"
          :disabled="isSending || sendStatus === 'success'"
          :class="[
            'w-full font-bold py-3.5 rounded-2xl transition text-xs flex items-center justify-center gap-2 shadow-md',
            sendStatus === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white active:scale-95 disabled:opacity-50'
          ]"
        >
          <span v-if="isSending" class="animate-spin text-base">⏳</span>
          <span v-else-if="sendStatus === 'success'">✅ Счёт доставлен парню в Telegram!</span>
          <span v-else>🚀 Отправить счёт парню в Telegram</span>
        </button>

        <!-- Сообщение об ошибке, если не настроен .env -->
        <p v-if="sendStatus === 'error'" class="text-[11px] text-rose-500 text-center font-medium">
          ⚠️ {{ errorMessage }}
        </p>

        <!-- Вторая кнопка: скопировать в буфер -->
        <button
          @click="copyReceipt"
          class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5"
        >
          <span>{{ copied ? '✅ Скопировано!' : '📋 Скопировать текстом' }}</span>
        </button>

        <!-- Закрыть -->
        <button
          @click="emit('close')"
          class="w-full text-slate-400 hover:text-slate-600 text-xs font-semibold py-1.5"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>