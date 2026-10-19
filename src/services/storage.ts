import type { Complaint } from '../types/store'

const CUSTOM_COMPLAINTS_KEY = 'complaint_store_custom_items'

// Получить сохранённые кастомные претензии
export function getSavedCustomComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(CUSTOM_COMPLAINTS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Complaint[]
  } catch (e) {
    console.error('Ошибка чтения кастомных претензий из localStorage', e)
    return []
  }
}

// Сохранить список кастомных претензий
export function saveCustomComplaints(complaints: Complaint[]): void {
  try {
    localStorage.setItem(CUSTOM_COMPLAINTS_KEY, JSON.stringify(complaints))
  } catch (e) {
    console.error('Ошибка записи кастомных претензий в localStorage', e)
  }
}