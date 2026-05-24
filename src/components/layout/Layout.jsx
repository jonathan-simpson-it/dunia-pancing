import { useState } from 'react'
import { ChatProvider } from '../../context/ChatContext'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatButton from '../ui/ChatButton'
import ChatWindow from '../ui/ChatWindow'

export default function Layout({ children }) {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <main className="flex-1">
          {children({ searchTerm, setSearchTerm })}
        </main>
        <Footer />
        <ChatButton />
        <ChatWindow />
      </div>
    </ChatProvider>
  )
}
