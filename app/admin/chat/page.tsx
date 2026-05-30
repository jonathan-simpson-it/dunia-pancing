'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '@/context/LanguageContext'
import id from '@/locales/id.json'
import en from '@/locales/en.json'

const localeId = id as Record<string, string>
const localeEn = en as Record<string, string>
const t = (key: string, lang: 'id' | 'en'): string => lang === 'id' ? localeId[key] : localeEn[key]

interface ConversationItem {
  id: string
  customerName: string | null
  customerPhone: string | null
  lastMessage: { text: string; sender: string; createdAt: string } | null
  unread: number
  updatedAt: string
}

interface Message {
  id: string
  text: string
  sender: string
  read: boolean
  createdAt: string
}

export default function AdminChat() {
  const { lang } = useLang()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    const res = await fetch('/api/chat/conversations')
    if (res.ok) setConversations(await res.json())
  }

  const fetchMessages = async (id: string) => {
    const res = await fetch(`/api/chat/conversations/${id}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages || [])
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetchMessages(selectedId)
    const interval = setInterval(() => fetchMessages(selectedId), 3000)
    return () => clearInterval(interval)
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = async (id: string) => {
    setSelectedId(id)
    await fetchMessages(id)
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unread: 0 } : c)
    )
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !selectedId) return
    const res = await fetch(`/api/chat/conversations/${selectedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reply.trim() }),
    })
    if (res.ok) {
      setReply('')
      await fetchMessages(selectedId)
      await fetchConversations()
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const sameDay = d.toDateString() === now.toDateString()
    if (sameDay) return formatTime(ts)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="w-72 sm:w-80 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            {lang === 'id' ? 'Percakapan' : 'Conversations'}
          </h2>
          <p className="text-[11px] text-slate-500">{conversations.length} percakapan</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-[12px]">
              {lang === 'id' ? 'Belum ada percakapan' : 'No conversations yet'}
            </div>
          ) : conversations.map(c => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`w-full text-left p-3.5 border-b border-slate-50 hover:bg-slate-50 transition-all ${
                selectedId === c.id ? 'bg-sky-50 border-l-2 border-l-brand-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-bold text-slate-900 truncate max-w-[160px]">
                  {c.customerName || c.customerPhone || (lang === 'id' ? 'Pelanggan' : 'Customer')}
                </span>
                <div className="flex items-center gap-2">
                  {c.unread > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{formatDate(c.updatedAt)}</span>
                </div>
              </div>
              {c.lastMessage && (
                <p className="text-[11px] text-slate-500 truncate">
                  {c.lastMessage.sender === 'admin' ? '👤 ' : ''}
                  {c.lastMessage.text}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedId ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-[13px] ${
                  m.sender === 'admin'
                    ? 'bg-brand-primary text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${
                    m.sender === 'admin' ? 'text-sky-200' : 'text-slate-400'
                  }`}>{formatTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleReply} className="border-t border-slate-100 p-4 flex gap-3">
            <input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder={lang === 'id' ? 'Ketik balasan...' : 'Type a reply...'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <button
              type="submit"
              disabled={!reply.trim()}
              className="px-5 py-2.5 bg-brand-primary text-white text-[12px] font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {lang === 'id' ? 'Kirim' : 'Send'}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-[13px]">
          {lang === 'id' ? 'Pilih percakapan untuk mulai membalas' : 'Select a conversation to start replying'}
        </div>
      )}
    </div>
  )
}
