<script setup lang="ts">
import { ref } from 'vue'
import type { Complaint, DramaLevel, Category } from '../types/store'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', complaint: Complaint): void
}>()

const emojis = ['😤', '🥺', '🤨', '🍕', '💻', '🧦', '🥶', '👀', '💅', '💣', '👑', '🛒']
const dramaLevels: DramaLevel[] = ['Лёгкий вздох', 'Надутые губки', 'Скандал', 'Оскар 🏆']
const selectableCategories: Exclude<Category, 'Все'>[] = ['Классика', 'Внимание', 'Еда и быт', 'Сны и мистика', 'Кастомные']

const selectedEmoji = ref('😤')
const title = ref('')
const description = ref('')
const category = ref<Exclude<Category, 'Все'>>('Кастомные')
const drama = ref<DramaLevel>('Надутые губки')
const priceEur = ref<number>(2.50)

// Готовые быстрые пресеты сумм
const quickPresets = [
  { label: '€0.50 Мелочь', value: 0.50 },
  { label: '€5.00 Обидно', value: 5.00 },
  { label: '€15.00 Серьёзно', value: 15.00 },
  { label: '€50.00 Катастрофа 💥', value: 50.00 }
]

const randomTemplates = [
  {
    title: 'Посмотрел на меня без должного восхищения',
    desc: 'Взгляд был каким-то слишком обычным, а я вообще-то старалась!',
    price: 3.50,
    emoji: '👀'
  },
  {
    title: 'Слишком громко клацаешь мышкой и клавиатурой',
    desc: 'Мешаешь мне лежать и наслаждаться тишиной.',
    price: 5.00,
    emoji: '💻'
  },
  {
    title: 'Не предложил чай, когда делал себе',
    desc: 'Я, может, и не хотела, но спросить был обязан по закону!',
    price: 2.00,
    emoji: '☕'
  },
  {
    title: 'Опять твои носки живут отдельной жизнью',
    desc: 'Обнаружен несанкционированный носок за пределами корзины.',
    price: 1.50,
    emoji: '🧦'
  },
  {
    title: 'Не угадал с первого раза, почему у меня плохое настроение',
    desc: 'У тебя было целых три секунды подумать.',
    price: 25.00,
    emoji: '💣'
  }
]

const fillRandom = () => {
  const random = randomTemplates[Math.floor(Math.random() * randomTemplates.length)]
  title.value = random.title
  description.value = random.desc
  priceEur.value = random.price
  selectedEmoji.value = random.emoji
}

const selectDrama = (level: DramaLevel) => {
  drama.value = level
  if (level === 'Лёгкий вздох') priceEur.value = 0.50
  if (level === 'Надутые губки') priceEur.value = 2.50
  if (level === 'Скандал') priceEur.value = 10.00
  if (level === 'Оскар 🏆') priceEur.value = 35.00
}

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let val = parseFloat(target.value)
  if (isNaN(val)) val = 0.10
  if (val > 50) val = 50
  if (val < 0.10) val = 0.10
  priceEur.value = Math.round(val * 100) / 100
}

const submit = () => {
  if (!title.value.trim()) return

  const newComplaint: Complaint = {
    id: Date.now(),
    title: title.value.trim(),
    description: description.value.trim() || 'Сформулировано лично и обжалованию в суде не подлежит.',
    category: category.value,
    priceEur: Number(priceEur.value),
    drama: drama.value,
    emoji: selectedEmoji.value
  }

  emit('create', newComplaint)
  title.value = ''
  description.value = ''
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-lg font-extrabold text-slate-800">⚡ Конструктор претензии</h3>
          <p class="text-xs text-slate-400">Назначь суровый штраф (до €50.00)</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
      </div>

      <!-- Кнопка автогенерации -->
      <button
        type="button"
        @click="fillRandom"
        class="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
      >
        <span>🎲</span>
        <span>Мне лень печатать — сгенерируй повод за меня!</span>
      </button>

      <!-- Выбор эмодзи -->
      <div>
        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">1. Выбери эмоцию</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="emo in emojis"
            :key="emo"
            type="button"
            @click="selectedEmoji = emo"
            :class="[
              'w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition',
              selectedEmoji === emo
                ? 'bg-rose-500 border-rose-500 scale-110 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            ]"
          >
            {{ emo }}
          </button>
        </div>
      </div>

      <!-- Поля ввода -->
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">2. В чём он провинился?</label>
          <input
            v-model="title"
            type="text"
            placeholder="Например: Не купил мне вкусняшку"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 text-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">3. Пояснительная записка</label>
          <textarea
            v-model="description"
            rows="2"
            placeholder="Опиши масштаб трагедии..."
            class="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Категория -->
      <div>
        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">4. Категория</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="cat in selectableCategories"
            :key="cat"
            type="button"
            @click="category = cat"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
              category === cat
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Уровень драмы -->
      <div>
        <label class="block text-xs font-bold text-slate-600 uppercase mb-1.5">5. Уровень драмы</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="level in dramaLevels"
            :key="level"
            type="button"
            @click="selectDrama(level)"
            :class="[
              'py-2 px-3 rounded-xl text-xs font-bold border transition',
              drama === level
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            ]"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Ползунок и ввод штрафа до €50 -->
      <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-bold text-slate-700">6. Сумма штрафа в чек:</span>
          <div class="flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1.5 rounded-xl shadow-inner">
            <span class="text-sm font-bold text-slate-400">€</span>
            <input
              type="number"
              min="0.10"
              max="50.00"
              step="0.50"
              :value="priceEur"
              @change="handlePriceInput"
              class="w-16 text-right font-black text-rose-600 focus:outline-none text-base bg-transparent"
            />
          </div>
        </div>

        <!-- Сам ползунок до 50 евро -->
        <input
          v-model.number="priceEur"
          type="range"
          min="0.10"
          max="50.00"
          step="0.25"
          class="w-full accent-rose-500 cursor-pointer"
        />

        <!-- Быстрые кнопки выбора -->
        <div class="grid grid-cols-4 gap-1.5 pt-1">
          <button
            v-for="preset in quickPresets"
            :key="preset.value"
            type="button"
            @click="priceEur = preset.value"
            :class="[
              'py-1 rounded-lg text-[11px] font-bold border transition',
              priceEur === preset.value
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
            ]"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="flex justify-between text-[10px] text-slate-400 pt-0.5">
          <span>€0.10 (Символический штраф)</span>
          <span>€25.00 (Серьёзный ужин)</span>
          <span>€50.00 (Банкротство)</span>
        </div>
      </div>

      <button
        @click="submit"
        :disabled="!title.trim()"
        class="w-full bg-gradient-to-r from-rose-500 to-purple-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition shadow-md"
      >
        Добавить в каталог и в чек (+€{{ Number(priceEur).toFixed(2) }})
      </button>
    </div>
  </div>
</template>