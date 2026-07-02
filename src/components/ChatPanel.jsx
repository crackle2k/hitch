import { useState, useEffect, useRef } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function formatTime(ts) {
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPanel({ friend, myId, authHeaders, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${friend.user_id}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch {
      // network error — silently ignore
    }
  }

  useEffect(() => {
    fetchMessages()
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => clearInterval(pollRef.current)
  }, [friend.user_id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setDraft('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ receiver_id: friend.user_id, content }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l-2 border-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b-2 border-black bg-[#C6F5D2] flex-shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-sm">{friend.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-black truncate">{friend.name}</p>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Friend</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-black hover:bg-black/10 border-transparent">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-3 text-gray-400">
            <MessageCircle className="h-10 w-10 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-wider">No messages yet. Say hi!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(msg => {
              const isMine = msg.sender_id === myId
              return (
                <div key={msg.id} className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
                  {!isMine && (
                    <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                      <AvatarFallback className="text-[10px]">{friend.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-[75%]">
                    <div className={cn('px-4 py-2.5 text-sm', isMine ? 'chat-bubble-mine' : 'chat-bubble-theirs')}>
                      {msg.content}
                    </div>
                    <p className={cn('text-[10px] font-medium text-gray-500 mt-1', isMine ? 'text-right' : 'text-left')}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-4 border-t-2 border-black flex-shrink-0 bg-[#F5F5F0]">
        <Input
          className="flex-1 text-sm"
          placeholder={`Message ${friend.name}…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <Button size="icon" variant="teal" onClick={sendMessage} disabled={!draft.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
