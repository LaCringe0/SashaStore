export type Category = 'Все' | 'Классика' | 'Внимание' | 'Еда и быт' | 'Сны и мистика' | 'Кастомные'

export type DramaLevel = 'Лёгкий вздох' | 'Надутые губки' | 'Скандал' | 'Оскар 🏆'

export interface Complaint {
  id: number
  title: string
  description: string
  category: Exclude<Category, 'Все'>
  priceEur: number // Например: 0.25 (€)
  drama: DramaLevel
  emoji: string
}

export interface CartItem {
  complaint: Complaint
  quantity: number
}

export interface ApologyOption {
  id: string
  title: string
  description: string
  feeEur: number // Надбавка к чеку в €
  emoji: string
}