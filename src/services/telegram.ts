import type { CartItem, ApologyOption } from '../types/store'

export async function sendReceiptToTelegram(params: {
  orderItems: CartItem[]
  selectedApologies: ApologyOption[]
  nervesTaxEur: number
  finalTotalEur: number
}): Promise<{ success: boolean; error?: string }> {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return {
      success: false,
      error: 'Не заданы VITE_TELEGRAM_BOT_TOKEN или VITE_TELEGRAM_CHAT_ID в .env'
    }
  }

  const dateStr = new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Список претензий
  const complaintsList = params.orderItems
    .map(
      (item, idx) =>
        `<b>${idx + 1}. ${item.complaint.emoji} ${item.complaint.title}</b> (x${item.quantity})\n` +
        `   └ Уровень драмы: <i>${item.complaint.drama}</i>\n` +
        `   └ Сумма: <b>€${(item.complaint.priceEur * item.quantity).toFixed(2)}</b>`
    )
    .join('\n\n')

  // Список извинений
  const apologiesList =
    params.selectedApologies.length > 0
      ? params.selectedApologies
          .map(a => `• ${a.emoji} <b>${a.title}</b> (+€${a.feeEur.toFixed(2)})`)
          .join('\n')
      : '<i>На усмотрение виновного (помилован)</i>'

  // Форматированное HTML-сообщение
  const message = `
🧾 <b>ОФИЦИАЛЬНЫЙ ЕВРО-СЧЁТ ПРЕТЕНЗИЙ</b>
📅 <i>${dateStr}</i>
────────────────────

📌 <b>СПИСОК ПРАВОНАРУШЕНИЙ:</b>
${complaintsList}

────────────────────
🤝 <b>ОБЯЗАТЕЛЬНЫЙ ПАКЕТ ИЗВИНЕНИЙ:</b>
${apologiesList}

────────────────────
📈 Налог на нервные клетки (10%): <b>€${params.nervesTaxEur.toFixed(2)}</b>
💶 <b>ИТОГО К ОПЛАТЕ: €${params.finalTotalEur.toFixed(2)}</b>

⚠️ <i>Счёт подлежит немедленной оплате поцелуями, массажем или вкусняшками! Срок обжалования: 0 секунд.</i>
`.trim()

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const data = await response.json()

    if (!data.ok) {
      return { success: false, error: data.description || 'Ошибка Telegram API' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Сетевая ошибка' }
  }
}