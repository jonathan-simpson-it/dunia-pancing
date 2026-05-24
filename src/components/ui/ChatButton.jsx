import { useChat } from '../../context/ChatContext'
import { useLang } from '../../context/LanguageContext'

export default function ChatButton() {
  const { isOpen, toggleChat, unread } = useChat()
  const { lang } = useLang()

  return (
    <button
      onClick={toggleChat}
      className={`fixed bottom-5 right-5 z-30 flex items-center gap-2.5 text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 ${
        isOpen
          ? 'bg-slate-700 hover:bg-slate-600'
          : 'bg-brand-primary hover:bg-sky-600 animate-pulse-shadow'
      }`}
      aria-label={lang === 'id' ? 'Buka Chat' : 'Open Chat'}
    >
      {isOpen ? (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}

      <span className="text-sm font-bold hidden sm:inline">
        {isOpen
          ? (lang === 'id' ? 'Tutup' : 'Close')
          : (lang === 'id' ? 'Chat' : 'Chat')}
      </span>

      {!isOpen && unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow px-1 border-2 border-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  )
}
