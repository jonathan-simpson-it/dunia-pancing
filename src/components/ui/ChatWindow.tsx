import { useState, useRef, useEffect } from 'react'
import { useChat } from '../../context/ChatContext'
import { useLang } from '../../context/LanguageContext'

export default function ChatWindow() {
  const { messages, isOpen, closeChat, sendMessage } = useChat()
  const { lang } = useLang()
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, messages.length])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input.trim(), lang)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts: string): string => {
    const d = new Date(ts)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatDate = (ts: string): string => {
    const d = new Date(ts)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) {
      return lang === 'id' ? 'Hari ini' : 'Today'
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return lang === 'id' ? 'Kemarin' : 'Yesterday'
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent sm:pointer-events-none" onClick={closeChat} />

      <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-24 sm:right-6 sm:w-96 sm:max-h-[560px] sm:rounded-2xl sm:shadow-2xl bg-white border-t sm:border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-brand-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
              DP
            </div>
            <div>
              <div className="text-sm font-bold">Dunia Pancing</div>
              <div className="text-[10px] text-white/80 font-medium">Online</div>
            </div>
          </div>
          <button onClick={closeChat} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50" style={{ minHeight: 320, maxHeight: 420 }}>
          {messages.map((msg, i) => {
            const isUser = msg.sender === 'user'
            const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(messages[i - 1]?.timestamp).toDateString()

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${i > 0 && messages[i - 1]?.sender === msg.sender ? 'mt-0.5' : ''}`}>
                  <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${
                      isUser
                        ? 'bg-brand-primary text-white rounded-br-md'
                        : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                    <div className={`text-[9px] text-slate-400 mt-0.5 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="shrink-0 border-t border-slate-100 p-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'id' ? 'Ketik pesan...' : 'Type a message...'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0 w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center hover:bg-sky-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
