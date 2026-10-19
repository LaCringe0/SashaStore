<script setup lang="ts">
import type { ApologyOption } from '../types/store'

defineProps<{
  options: ApologyOption[]
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
}>()
</script>

<template>
  <div class="space-y-2.5">
    <div class="flex items-center justify-between">
      <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
        🤝 Система извинений (обязательные санкции)
      </h4>
      <span class="text-[11px] text-rose-500 font-semibold">Выбери способы искупления</span>
    </div>

    <div class="space-y-2">
      <div
        v-for="opt in options"
        :key="opt.id"
        @click="emit('toggle', opt.id)"
        :class="[
          'p-3 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-2.5 select-none',
          selectedIds.includes(opt.id)
            ? 'bg-purple-50/90 border-purple-400 shadow-sm'
            : 'bg-white border-slate-200 hover:border-rose-200'
        ]"
      >
        <div class="flex items-start gap-2.5">
          <input
            type="checkbox"
            :checked="selectedIds.includes(opt.id)"
            class="mt-1 accent-purple-600 rounded pointer-events-none"
          />
          <div>
            <p class="text-xs font-bold text-slate-800">
              {{ opt.emoji }} {{ opt.title }}
            </p>
            <p class="text-[11px] text-slate-500 leading-snug mt-0.5">
              {{ opt.description }}
            </p>
          </div>
        </div>

        <span class="text-xs font-extrabold text-purple-700 shrink-0">
          +€{{ opt.feeEur.toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>