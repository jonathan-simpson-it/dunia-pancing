import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const ChatContext = createContext()
const STORAGE_KEY = 'dunia-pancing-chat'
const ADMIN_DELAY = 1500

const AUTO_REPLIES = {
  id: [
    { keywords: ['stok', 'tersedia', 'barang', 'ready'], reply: 'Untuk informasi stok terkini, silakan cek langsung di halaman produk. Jika ada produk tertentu yang ingin ditanyakan, sebutkan nama produknya ya!' },
    { keywords: ['harga', 'mahal', 'murah', 'diskon', 'promo'], reply: 'Harga produk sudah tercantum di katalog kami. Kami juga memiliki diskon khusus untuk pembelian grosir. Hubungi admin untuk info lebih lanjut.' },
    { keywords: ['kirim', 'ongkir', 'pengiriman', 'sampai', 'lama', 'cod'], reply: 'Kami melayani pengiriman ke seluruh Indonesia via JNE, J&T, dan SiCepat. Bisa juga COD untuk area Palembang. Estimasi 2-5 hari kerja.' },
    { keywords: ['bayar', 'transfer', 'pembayaran', 'payment', 'bca', 'bri'], reply: 'Pembayaran bisa melalui transfer Bank BCA, BRI, Mandiri, atau COD. Untuk transfer, silakan lakukan ke rekening yang tertera di halaman checkout.' },
    { keywords: ['garansi', 'retur', 'tukar', 'kembali', 'rusak'], reply: 'Setiap produk kami bergaransi 30 hari. Jika ada kerusakan, silakan hubungi kami dengan menyertakan foto/video sebagai bukti.' },
  ],
  en: [
    { keywords: ['stock', 'available', 'ready'], reply: 'For current stock information, please check directly on the product page. If you have a specific product in mind, let us know the name!' },
    { keywords: ['price', 'expensive', 'cheap', 'discount', 'promo'], reply: 'Product prices are listed in our catalog. We also offer special discounts for wholesale purchases. Contact admin for more info.' },
    { keywords: ['ship', 'shipping', 'delivery', 'arrive', 'cod'], reply: 'We ship nationwide via JNE, J&T, and SiCepat. COD is available for Palembang area. Estimated 2-5 business days.' },
    { keywords: ['pay', 'transfer', 'payment', 'bca', 'bri'], reply: 'Payment can be made via BCA, BRI, Mandiri bank transfer, or COD. For transfers, please use the account provided at checkout.' },
    { keywords: ['warranty', 'return', 'refund', 'damage', 'exchange'], reply: 'All our products come with a 30-day warranty. If there is any damage, please contact us with photo/video evidence.' },
  ],
}

const GREETING = {
  id: { user: 'Halo! Ada yang bisa kami bantu?', admin: 'Halo! Ada yang bisa kami bantu?' },
  en: { user: 'Hello! How can we help you?', admin: 'Hello! How can we help you?' },
}

function findReply(text, lang) {
  const lower = text.toLowerCase()
  const replies = AUTO_REPLIES[lang] || AUTO_REPLIES.id
  for (const entry of replies) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.reply
    }
  }
  return null
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

let msgIdCounter = 0
function nextId() { return `msg_${Date.now()}_${++msgIdCounter}` }

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const adminTimerRef = useRef(null)

  useEffect(() => {
    const saved = loadMessages()
    if (saved.length === 0) {
      const lang = navigator.language?.startsWith('id') ? 'id' : 'en'
      const greeting = {
        id: nextId(),
        text: GREETING[lang].admin,
        sender: 'admin',
        timestamp: new Date().toISOString(),
      }
      setMessages([greeting])
      localStorage.setItem(STORAGE_KEY, JSON.stringify([greeting]))
    } else {
      setMessages(saved)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }
  }, [messages, loaded])

  const addMessage = useCallback((text, sender) => {
    const msg = {
      id: nextId(),
      text,
      sender,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
    return msg
  }, [])

  const sendMessage = useCallback((text, lang = 'id') => {
    if (!text.trim()) return
    addMessage(text.trim(), 'user')

    if (adminTimerRef.current) clearTimeout(adminTimerRef.current)

    adminTimerRef.current = setTimeout(() => {
      const reply = findReply(text, lang)
      if (reply) {
        addMessage(reply, 'admin')
      } else {
        const generic = lang === 'id'
          ? 'Mohon tunggu, admin kami akan segera merespon pesan Anda.'
          : 'Please wait, our admin will respond to your message shortly.'
        addMessage(generic, 'admin')
      }
    }, ADMIN_DELAY)
  }, [addMessage])

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), [])

  const unread = messages.filter(m => m.sender === 'admin' && !m.read).length

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      sendMessage,
      openChat,
      closeChat,
      toggleChat,
      unread,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
