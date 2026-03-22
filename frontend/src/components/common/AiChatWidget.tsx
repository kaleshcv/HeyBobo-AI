import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAIChat } from '@/hooks/useAI'

interface AiChatWidgetProps {
  conversationId?: string
  courseId?: string
  lessonId?: string
  onClose?: () => void
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({
  conversationId,
  courseId,
  lessonId,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const aiChat = useAIChat(conversationId || null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    aiChat.mutate({
      message: input,
      context: { courseId, lessonId },
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
        title="Open AI Tutor"
      >
        <MessageCircle size={24} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100%-2rem)] h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h3 className="font-semibold">AI Tutor</h3>
        <button
          onClick={() => {
            setIsOpen(false)
            onClose?.()
          }}
          className="hover:bg-primary-700 p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Ask me anything about the course!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {aiChat.isPending && (
          <div className="flex gap-2 items-center text-gray-600">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button
            size="md"
            onClick={handleSend}
            disabled={aiChat.isPending || !input.trim()}
            className="px-3"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  )
}
