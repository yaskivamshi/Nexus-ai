// src/components/chat/ChatInput.jsx
import { useState, useRef, useCallback } from 'react'
import { Send, Square, Paperclip } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { cn } from '../../lib/utils'
import { motion } from 'framer-motion'
import VoiceButton from '../voice/VoiceButton'

export default function ChatInput({ onSend, isStreaming, onStop, lastAiMessage }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    }
  }

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [input, isStreaming, onSend])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="sticky bottom-0 px-6 pb-6 pt-4 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent">
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-end gap-2 p-2.5 rounded-xl border border-[#27272a] bg-[#121214]',
          'focus-within:border-[#3b82f6]/40 transition-all duration-200'
        )}
      >
        {/* Paperclip asset trigger button updated to match slate layout styling */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 shrink-0 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[#1c1c1f]"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Re-padded seamless transparent text editor window */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message Nexus AI..."
          className={cn(
            'flex-1 min-h-[36px] max-h-[200px] resize-none border-0 bg-transparent py-2 px-1',
            'focus-visible:ring-0 focus-visible:ring-offset-0 font-sans',
            'text-[14px] text-[#fafafa] placeholder:text-[#71717a]/60'
          )}
          rows={1}
          disabled={isStreaming}
        />

        {/* Integrated voice controller trigger portal */}
        <div className="flex items-center h-9 shrink-0 gap-1.5 px-1">
          <VoiceButton
            onTranscript={(text) => setInput(text)}
            textToSpeak={lastAiMessage?.role === 'assistant' ? lastAiMessage.content : ''}
          />
        </div>

        {/* Send / Stop action module configuration */}
        <Button
          size="icon"
          onClick={isStreaming ? onStop : handleSend}
          disabled={!isStreaming && !input.trim()}
          className={cn(
            "w-8 h-8 shrink-0 rounded-lg transition-all duration-150 shadow-sm",
            isStreaming
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 disabled:bg-[#1c1c1f] disabled:text-[#71717a]/50 disabled:border disabled:border-[#27272a]/30 shadow-[#3b82f6]/5"
          )}
        >
          {isStreaming ? (
            <Square className="w-3 h-3 fill-current" />
          ) : (
            <Send className="w-3 h-3" />
          )}
        </Button>
      </motion.div>
      <p className="text-center text-[11px] text-[#71717a]/50 mt-2.5 font-normal tracking-wide select-none">
        Nexus AI can make mistakes. Verify important information.
      </p>
    </div>
  )
}