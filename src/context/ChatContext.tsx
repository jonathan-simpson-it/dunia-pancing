'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { ChatMessage, ChatSender } from '../types'

interface ChatContextValue {
  messages: ChatMessage[]
  isOpen: boolean
  sendMessage: (text: string, lang?: 'id' | 'en') => void
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  unread: number
}

const ChatContext = createContext<ChatContextValue>(null!)
const SESSION_KEY = 'dunia-pancing-chat-session'

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = 'session_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'session_' + Math.random().toString(36).slice(2, 10)
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionId = useRef('')

  useEffect(() => {
    sessionId.current = getSessionId()
    syncMessages()
    pollingRef.current = setInterval(syncMessages, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const syncMessages = useCallback(async () => {
    if (!sessionId.current) return
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId.current}`)
      if (!res.ok) return
      const data = await res.json()
      const msgs: ChatMessage[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        text: m.text,
        sender: m.sender as ChatSender,
        timestamp: m.createdAt,
      }))
      setMessages(msgs)
      setUnread(msgs.filter(m => m.sender === 'admin' && !m.read).length)
    } catch {}
  }, [])

  const sendMessage = useCallback((text: string, lang?: 'id' | 'en') => {
    if (!text.trim()) return
    try {
      const name = localStorage.getItem('dunia-pancing-session-name') || ''
      const phone = localStorage.getItem('dunia-pancing-session-phone') || ''
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          sessionId: sessionId.current,
          name: name || undefined,
          phone: phone || undefined,
          lang: lang || 'id',
        }),
      }).then(() => syncMessages())
    } catch {
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), sessionId: sessionId.current, lang: lang || 'id' }),
      }).then(() => syncMessages())
    }
  }, [syncMessages])

  const openChat = useCallback(() => {
    setIsOpen(true)
    setUnread(0)
  }, [])

  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen(o => !o), [])

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
