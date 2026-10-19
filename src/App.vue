<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Category, Complaint, CartItem, ApologyOption } from './types/store'
import { initialComplaints, apologyOptions } from './data/initialData'
import { getSavedCustomComplaints, saveCustomComplaints } from './services/storage'
import { fireDramaConfetti, triggerScreenShake } from './services/effects'

import ThreeBackground from './components/ThreeBackground.vue'
import StoreHeader from './components/StoreHeader.vue'
import ComplaintCard from './components/ComplaintCard.vue'
import ComplaintBuilderModal from './components/ComplaintBuilderModal.vue'
import CartDrawer from './components/CartDrawer.vue'
import EuroReceiptModal from './components/EuroReceiptModal.vue'

const categories: Category[] = ['Все', 'Классика', 'Внимание', 'Еда и быт', 'Сны и мистика', 'Кастомные']
const activeCategory = ref<Category>('Все')

const customComplaints = ref<Complaint[]>([])
const complaints = ref<Complaint[]>([...initialComplaints])
const cart = ref<CartItem[]>([])
const selectedApologyIds = ref<string[]>(['hug_tax', 'admit_right'])

onMounted(() => {
  customComplaints.value = getSavedCustomComplaints()
  complaints.value = [...customComplaints.value, ...initialComplaints]
})

const isBuilderOpen = ref(false)
const isCartOpen = ref(false)
const isReceiptOpen = ref(false)

const lastOrderItems = ref<CartItem[]>([])
const lastOrderApologies = ref<ApologyOption[]>([])
const lastNervesTax = ref(0)
const lastFinalTotal = ref(0)

const filteredComplaints = computed(() => {
  if (activeCategory.value === 'Все') return complaints.value
  return complaints.value.filter(c => c.category === activeCategory.value)
})

const roundCents = (val: number) => Math.round(val * 100) / 100

const complaintsSubtotal = computed(() =>
  roundCents(cart.value.reduce((sum, item) => sum + item.complaint.priceEur * item.quantity, 0))
)

const apologiesSubtotal = computed(() => {
  if (cart.value.length === 0) return 0
  return roundCents(
    apologyOptions
      .filter(opt => selectedApologyIds.value.includes(opt.id))
      .reduce((sum, opt) => sum + opt.feeEur, 0)
  )
})

const currentBillEur = computed(() => roundCents(complaintsSubtotal.value + apologiesSubtotal.value))
const cartCount = computed(() => cart.value.reduce((cnt, item) => cnt + item.quantity, 0))

// Шкала уровня опасности (DEFCON)
const dangerStatus = computed(() => {
  const bill = currentBillEur.value
  if (bill === 0) return { label: '🟢 Штиль: пока ни в чём не виноват', color: 'bg-emerald-500', percent: 5 }
  if (bill < 2) return { label: '🟡 Лёгкое недовольство: отделаешься поцелуем', color: 'bg-amber-400', percent: 30 }
  if (bill < 10) return { label: '🟠 Оранжевый код: готовь шоколадку и оправдания', color: 'bg-orange-500', percent: 65 }
  return { label: '🔴 КРАСНАЯ ТРЕВОГА: срочная эвакуация в магазин за вкусняшками!', color: 'bg-rose-600 animate-pulse', percent: 100 }
})

const getQuantityInCart = (id: number): number => {
  return cart.value.find(i => i.complaint.id === id)?.quantity || 0
}

const addToCart = (complaint: Complaint) => {
  const existing = cart.value.find(i => i.complaint.id === complaint.id)
  if (existing) {
    existing.quantity++
  } else {
    cart.value.push({ complaint, quantity: 1 })
  }

  // Трясём экран, если претензия с драмой "Оскар" или дороже €10
  if (complaint.priceEur >= 10 || complaint.drama === 'Оскар 🏆') {
    triggerScreenShake(complaint.priceEur >= 20 ? 'heavy' : 'medium')
  }
}

const decreaseFromCart = (id: number) => {
  const idx = cart.value.findIndex(i => i.complaint.id === id)
  if (idx !== -1) {
    if (cart.value[idx].quantity > 1) {
      cart.value[idx].quantity--
    } else {
      cart.value.splice(idx, 1)
    }
  }
}

const toggleApology = (id: string) => {
  const idx = selectedApologyIds.value.indexOf(id)
  if (idx === -1) {
    selectedApologyIds.value.push(id)
  } else {
    selectedApologyIds.value.splice(idx, 1)
  }
}

const handleCreateCustom = (newComplaint: Complaint) => {
  customComplaints.value.unshift(newComplaint)
  saveCustomComplaints(customComplaints.value)
  complaints.value.unshift(newComplaint)
  addToCart(newComplaint)
}

const handleDeleteCustom = (id: number) => {
  customComplaints.value = customComplaints.value.filter(c => c.id !== id)
  saveCustomComplaints(customComplaints.value)
  complaints.value = complaints.value.filter(c => c.id !== id)
  cart.value = cart.value.filter(item => item.complaint.id !== id)
}

const handleCheckout = () => {
  if (cart.value.length === 0) return

  const sub = currentBillEur.value
  const tax = roundCents(sub * 0.1)

  lastOrderItems.value = [...cart.value]
  lastOrderApologies.value = apologyOptions.filter(a => selectedApologyIds.value.includes(a.id))
  lastNervesTax.value = tax
  lastFinalTotal.value = roundCents(sub + tax)

  cart.value = []
  isCartOpen.value = false
  isReceiptOpen.value = true

  // Запускаем салют из евро и разбитых сердечек!
  fireDramaConfetti()
}
</script>

<template>
  <div class="relative min-h-screen bg-gradient-to-br from-rose-100/70 via-pink-50 to-purple-100/80 text-slate-800 pb-20 overflow-x-hidden">
    <!-- Интерактивный 3D-фон на Three.js -->
    <ThreeBackground :bill-eur="currentBillEur" :cart-count="cartCount" />

    <!-- Контент поверх 3D-сцены -->
    <div class="relative z-10">
      <StoreHeader
        :cart-count="cartCount"
        :current-bill-eur="currentBillEur"
        @open-cart="isCartOpen = true"
        @open-builder="isBuilderOpen = true"
      />

      <main class="max-w-5xl mx-auto px-4 pt-6">
        <!-- Шкала уровня опасности (DEFCON) -->
        <div class="bg-white/75 backdrop-blur-md border border-white rounded-2xl p-3.5 mb-5 shadow-sm">
          <div class="flex items-center justify-between text-xs font-extrabold mb-1.5">
            <span>🌡️ Уровень женского гнева:</span>
            <span class="text-slate-700">{{ dangerStatus.label }}</span>
          </div>
          <div class="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500 rounded-full"
              :class="dangerStatus.color"
              :style="{ width: `${dangerStatus.percent}%` }"
            />
          </div>
        </div>

        <!-- Промо-баннер с Glassmorphism -->
        <div class="bg-gradient-to-r from-rose-500/90 via-pink-500/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-6 md:p-8 text-white shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-5 border border-white/30">
          <div class="space-y-2 text-center md:text-left">
            <span class="inline-block bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full uppercase">
              💶 Тарификация 3D-Правосудия
            </span>
            <h2 class="text-2xl md:text-3xl font-black drop-shadow-sm">
              Он опять что-то натворил или просто бесит?
            </h2>
            <p class="text-rose-100 text-xs sm:text-sm max-w-xl">
              Наводи на карточки, собирай комбо из его грехов, следи за градусом гнева и отправляй счёт прямо ему в Telegram!
            </p>
          </div>

          <button
            @click="isBuilderOpen = true"
            class="shrink-0 bg-white text-rose-600 hover:bg-rose-50 active:scale-95 font-extrabold px-5 py-3.5 rounded-2xl shadow-lg transition text-xs sm:text-sm"
          >
            ⚡ Создать свою претензию
          </button>
        </div>

        <!-- Фильтр категорий -->
        <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-5">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            :class="[
              'px-4 py-2 rounded-full text-xs font-bold transition shrink-0 border backdrop-blur-md',
              activeCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white/75 text-slate-700 border-white hover:border-rose-300'
            ]"
          >
            {{ cat }}
            <span
              v-if="cat === 'Кастомные' && customComplaints.length > 0"
              class="ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full"
            >
              {{ customComplaints.length }}
            </span>
          </button>
        </div>

        <!-- Сетка 3D-карточек -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ComplaintCard
            v-for="item in filteredComplaints"
            :key="item.id"
            :item="item"
            :quantity-in-cart="getQuantityInCart(item.id)"
            @add="addToCart"
            @delete="handleDeleteCustom"
          />
        </div>
      </main>
    </div>

    <ComplaintBuilderModal
      :is-open="isBuilderOpen"
      @close="isBuilderOpen = false"
      @create="handleCreateCustom"
    />

    <CartDrawer
      :is-open="isCartOpen"
      :cart="cart"
      :apology-options="apologyOptions"
      :selected-apology-ids="selectedApologyIds"
      :complaints-subtotal="complaintsSubtotal"
      :apologies-subtotal="apologiesSubtotal"
      :total-eur="currentBillEur"
      @close="isCartOpen = false"
      @add="addToCart"
      @decrease="decreaseFromCart"
      @toggle-apology="toggleApology"
      @checkout="handleCheckout"
    />

    <EuroReceiptModal
      :is-open="isReceiptOpen"
      :order-items="lastOrderItems"
      :selected-apologies="lastOrderApologies"
      :nerves-tax-eur="lastNervesTax"
      :final-total-eur="lastFinalTotal"
      @close="isReceiptOpen = false"
    />
  </div>
</template>