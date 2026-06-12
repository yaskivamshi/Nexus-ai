// src/pages/Chat.jsx — Main Unified Multimodal Chat Page
import { useEffect, useRef, useCallback, useState } from 'react'
import { Bot, Sparkles, Copy, Check, User2, Terminal, Paperclip, FileText, X, Mic, MicOff, Volume2, VolumeX, Send, Square, Cpu, Server } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { useStream } from '../hooks/useStream'
import { cn } from '../lib/utils'
import ReactMarkdown from 'react-markdown'
import { Button } from '../components/ui/button'
import remarkGfm from 'remark-gfm'

const STARTERS = [
  { icon: '💡', text: 'Explain quantum computing simply' },
  { icon: '💻', text: 'Write a Python web scraper' },
  { icon: '📝', text: 'Help me write a cover letter' },
  { icon: '🔍', text: 'Analyze this data trend' },
]

export default function Chat() {
  // Destructure activeProvider and structural states from the architecture store safely
  const { 
    chats, 
    activeChatId, 
    createChat, 
    addMessage, 
    updateLastMessage, 
    updateChatTitle, 
    selectedModel, 
    activeProvider 
  } = useChatStore()
  
  const { user } = useAuthStore()
  const { streamChat, stopStream, isStreaming } = useStream()
  
  // Input Matrix & Component UI States
  const [input, setInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isTextToSpeechActive, setIsTextToSpeechActive] = useState(true)
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null)
  
  // Ref Hooks tracking native DOM positions for absolute scrolling constraints
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const speechUtteranceRef = useRef(null)

  const activeChat = chats.find((c) => c.id === activeChatId)
  const messages = activeChat?.messages ?? []

  // High-performance container scroll vector snap targeting native coordinates
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming, scrollToBottom])

  // Auto-resize textarea box limits dynamically
  const handleInputResize = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 140) + 'px'
    }
  }

  // ── TEXT TO SPEECH (TTS ENGINE) ──
  const toggleTextToSpeech = (msgId, text) => {
    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel()
      setCurrentlySpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    if (!isTextToSpeechActive) return

    const dynamicText = text.replace(/[*#`_\-]/g, '') // Strip Markdown tokens safely
    const utterance = new SpeechSynthesisUtterance(dynamicText.slice(0, 400))
    speechUtteranceRef.current = utterance
    
    utterance.onend = () => setCurrentlySpeakingId(null)
    utterance.onerror = () => setCurrentlySpeakingId(null)
    
    setCurrentlySpeakingId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // ── SPEECH TO TEXT (STT RECOGNITION HANDSHAKE) ──
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice recognition unsupported on this browser client core.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript.trim()) {
        setInput(transcript)
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }

    recognition.start()
  }

  // ── FILE ATTACHMENT PIPELINE MANAGEMENT ──
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const isImage = file.type.startsWith('image/')
      const reader = new FileReader()
      
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          isImage,
          url: reader.result
        }])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(item => item.id !== id))
  }

  const triggerCopy = async (id, textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedId(id)
      toast.success('Response copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error('Failed to copy payload contents.')
    }
  }

  // ── UNIFIED CORE DISPATCH HANDLER ──
  const handleSend = useCallback(async (forcedContent) => {
    const textContent = typeof forcedContent === 'string' ? forcedContent : input.trim()
    if (!textContent && attachments.length === 0) return

    let chatId = activeChatId
    if (!chatId) chatId = createChat(user?.id)

    // Package unified multi-input data message structure payload
    const userMessage = { 
      role: 'user', 
      content: textContent, 
      id: crypto.randomUUID(),
      attachments: attachments.length > 0 ? attachments : undefined
    }
    
    addMessage(chatId, userMessage, user?.id)
    setInput('')
    setAttachments([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const assistantId = crypto.randomUUID()
    addMessage(chatId, { role: 'assistant', content: '', id: assistantId }, user?.id)

    // Read the fresh state snapshot directly from the store to prevent closure reference synchronization lags
    const currentChats = useChatStore.getState().chats
    const currentChat = currentChats.find((c) => c.id === chatId)
    
    if (!currentChat || currentChat.messages.length <= 2) {
      updateChatTitle(chatId, textContent ? textContent.slice(0, 40) : 'Attached Media Analytics File', user?.id)
    }

    const history = [...(currentChat?.messages ?? []), userMessage]
    let accumulated = ''

    await streamChat({
      messages: history,
      model: selectedModel,
      onToken: (token) => {
        accumulated += token
        updateLastMessage(chatId, accumulated, user?.id)
      },
      onDone: () => {},
      onError: (err) => {
        toast.error('Multi-model communication cluster connection fail.')
        updateLastMessage(chatId, 'Sorry, something went wrong processing that streaming frame request. Make sure your chosen local or cloud engine is active.', user?.id)
      },
    })
  // FIXED: Synchronized dependency matrix mappings to cleanly capture execution parameters dynamically
  }, [activeChatId, selectedModel, createChat, addMessage, updateLastMessage, updateChatTitle, streamChat, input, attachments, user?.id])

  // Computed display string for clean model header metrics
  const modelDisplayName = selectedModel && selectedModel.includes('/') 
    ? selectedModel.split('/').pop() 
    : (selectedModel || 'Unselected')

  return (
    // ADJUSTMENT 1: Added dynamic mobile-viewport constraints (100dvh) to anchor the UI layout when soft keyboards lift
    <div className="flex flex-col h-[100dvh] md:h-full bg-[#020617] relative overflow-hidden">
      
      {/* ADJUSTMENT 2: Added screen-width boundaries. On narrow viewports, text shrinks or truncates nicely */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b0f19]/90 border border-white/10 backdrop-blur-md shadow-lg text-[10px] sm:text-[11px] font-medium tracking-wide text-[#cbd5e1] max-w-[85%] truncate">
        {activeProvider === 'openrouter' ? (
          <>
            <Server className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">Cloud Gateway: <span className="text-white font-semibold capitalize font-mono">{modelDisplayName}</span></span>
          </>
        ) : (
          <>
            <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Ollama Node: <span className="text-white font-semibold font-mono">{modelDisplayName}</span></span>
          </>
        )}
      </div>

      {/* Native Hidden Ingestion Elements Frame */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        accept="image/*,application/pdf,.doc,.docx,.txt" 
        className="hidden" 
      />

      {/* Ambiance Mesh Graphics Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-[#8b5cf6]/5 rounded-full blur-[150px]" />
      </div>

      {messages.length === 0 ? (
        /* ── ONBOARDING STATE SCREEN ── */
        // ADJUSTMENT 3: Scaled up dynamic top padding limits (pt-20 sm:pt-6) and wrapped inside an auto-scrolling container block
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-5 text-center z-10 relative max-w-xl mx-auto w-full overflow-y-auto pt-20 sm:pt-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/10 border border-[#3b82f6]/30 flex items-center justify-center shadow-md shrink-0"
          >
            <Bot className="w-4 h-4 text-[#3b82f6]" />
          </motion.div>
          
          <div className="space-y-1.5 shrink-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-mono uppercase">Multimodal AI Workspace</h1>
            <p className="text-[11px] sm:text-xs text-[#94a3b8] max-w-sm mx-auto leading-relaxed font-normal px-1">
              Ask questions, upload complex documentation, parse high-definition images, or conduct real-time voice operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1 max-h-[45vh] overflow-y-auto px-0.5">
            {STARTERS.map((s, idx) => (
              <motion.button
                key={s.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSend(s.text)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-[#111827]/40 hover:bg-[#1e293b]/60 text-left text-xs transition-all group cursor-pointer"
              >
                <span className="text-sm bg-[#020617] w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 shrink-0 shadow-inner group-hover:border-[#3b82f6]/30 transition-colors">{s.icon}</span>
                <span className="text-[#cbd5e1] font-medium group-hover:text-white transition-colors truncate text-[11px] sm:text-xs">{s.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        /* ── ACTIVE SCROLL-SAFE CONVERSATION TIMELINE ── */
        <div 
          ref={scrollContainerRef} 
          className="flex-1 overflow-y-auto z-10 w-full scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5"
        >
          {/* ADJUSTMENT 4: Optimized baseline offset heights (pt-16 sm:pt-24) to accommodate sticky top navigation components cleanly */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-6 space-y-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user'
                if (!isUser && !msg.content && !isStreaming) return null

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3 w-full text-left items-start',
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      'w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 border mt-1 shadow-sm font-bold font-mono text-[10px] select-none',
                      isUser ? 'bg-[#1e293b] border-white/5 text-[#94a3b8]' : 'bg-gradient-to-br from-[#8b5cf6]/10 to-[#3b82f6]/5 border-[#8b5cf6]/20 text-[#8b5cf6]'
                    )}>
                      {isUser ? <User2 className="w-3 h-3" /> : 'N'}
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-[88%] sm:max-w-[82%] min-w-0">
                      
                      {/* Multimedia File Previews inside bubbles */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={cn("flex flex-wrap gap-1.5 mb-0.5", isUser ? "justify-end" : "justify-start")}>
                          {msg.attachments.map((file) => (
                            <div key={file.id} className="relative rounded-xl overflow-hidden border border-white/10 max-w-[140px] bg-[#111827] shadow-lg">
                              {file.isImage ? (
                                <img src={file.url} alt="Attached vector asset" className="w-auto h-20 object-cover max-w-[130px]" />
                              ) : (
                                <div className="p-2 flex items-center gap-1.5 text-xs text-white">
                                  <FileText className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                                  <span className="truncate max-w-[90px] font-mono text-[9px]">{file.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Chat Text Bubble Surface Layout Container */}
                      <div className={cn(
                        'rounded-2xl px-4 py-2.5 text-xs sm:text-sm relative leading-relaxed group transition-all',
                        isUser
                          ? 'bg-[#1e293b] border border-white/5 text-white rounded-tr-sm shadow-md font-medium'
                          : 'bg-[#111827]/70 border border-white/10 text-[#f1f5f9] rounded-tl-sm shadow-xl backdrop-blur-sm'
                      )}>
                        
                        {/* Interactive Control HUD visible on hover */}
                        {!isUser && msg.content && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 bg-[#0b0f19] border border-white/10 rounded-md p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleTextToSpeech(msg.id, msg.content)}
                              className={cn(
                                "p-1 rounded text-[#94a3b8] transition-all hover:text-white cursor-pointer",
                                currentlySpeakingId === msg.id && "text-[#3b82f6]"
                              )}
                              title="Voice Response (Text-to-Speech)"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerCopy(msg.id, msg.content)}
                              className="p-1 rounded text-[#94a3b8] hover:text-white cursor-pointer"
                              title="Copy response markdown context"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        {isUser ? (
                          <p className="text-[#f8fafc] whitespace-pre-wrap font-normal break-words">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none space-y-3 pr-2 text-left break-words
                            prose-p:text-[#e2e8f0] prose-p:leading-relaxed prose-p:font-normal
                            prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-1
                            prose-strong:text-[#3b82f6] prose-strong:font-bold
                            prose-ol:list-decimal prose-ol:pl-4 prose-ol:space-y-1.5 prose-ol:text-[#cbd5e1]
                            prose-ul:list-disc prose-ul:pl-4 prose-ul:space-y-1 prose-ul:text-[#cbd5e1]
                            prose-li:text-[#cbd5e1] prose-li:text-xs sm:prose-li:text-sm
                            prose-code:text-[#3b82f6] prose-code:bg-[#3b82f6]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded font-mono text-xs">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content || '▍'}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {isStreaming && messages[messages.length - 1]?.content !== '' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full gap-4 justify-start items-center pl-10"
                >
                  <div className="flex items-center gap-1.5 bg-[#111827]/40 border border-white/5 px-2 py-0.5 rounded-md text-[9px] font-mono text-[#3b82f6] animate-pulse shadow-sm">
                    <Terminal className="w-2.5 h-2.5 text-[#3b82f6]" />
                    <span>Nexus is writing code blocks...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Native target bounding box for smooth viewport locking */}
            <div ref={messagesEndRef} className="h-2 w-full shrink-0" />
          </div>
        </div>
      )}

      {/* ── CONSOLIDATED UNIFIED MULTIMODAL CONTROL INPUT TRAY ── */}
      {/* ADJUSTMENT 5: Switched to explicit layout padding counters (p-3 sm:p-4) to prevent bottom overlap on small touch panels */}
      <div className="shrink-0 z-20 w-full bg-[#020617] border-t border-white/5 p-3 sm:p-4 pb-4 sm:pb-5 max-w-3xl mx-auto space-y-2">
        
        {/* Attachment Queue Upload Previews row */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#111827]/60 border border-white/5 backdrop-blur-md text-left">
              {attachments.map(file => (
                <div key={file.id} className="relative rounded-lg overflow-hidden border border-white/10 h-11 w-11 bg-[#020617] shrink-0">
                  {file.isImage ? (
                    <img src={file.url} alt="Uploaded matrix chunk snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-[7px] font-mono text-[#94a3b8]">
                      <FileText className="w-3 h-3 text-[#3b82f6] mb-0.5" />
                      <span className="truncate w-full text-center px-0.5">{file.name}</span>
                    </div>
                  )}
                  <button onClick={() => removeAttachment(file.id)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-md text-white hover:text-rose-400 opacity-100 transition-opacity cursor-pointer">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SINGLE INTEGRATED CONSOLE INPUT BAR ROW - FIXED CONSOLE COLLISIONS */}
        <div className="flex items-end gap-1.5 p-1.5 rounded-xl border border-white/10 bg-[#0b0f19] focus-within:border-[#3b82f6]/40 transition-all shadow-inner">
          
          {/* File Attachment Trigger Button */}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#94a3b8]/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-pointer shrink-0"
            title="Attach Document Payload (PDF/Images/Docs)"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          {/* Core Autogrow Input Text Box Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputResize}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Message Nexus AI... (Supports voice & files)"
            className="flex-1 min-h-[32px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-xs sm:text-sm placeholder-[#94a3b8]/30 py-1.5 focus:outline-none font-normal text-white"
            rows={1}
            disabled={isStreaming}
          />

          {/* Real-time Voice Command STT Button */}
          <button 
            type="button"
            onClick={handleVoiceInput}
            className={cn(
              "p-2 transition-all border rounded-lg cursor-pointer shrink-0",
              isListening 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : "text-[#94a3b8]/60 bg-white/5 hover:bg-white/10 border-white/5"
            )}
            title="Voice Dictation Mode (Speech-to-Text)"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          
          {/* Audio Output Feedback TTS Button */}
          <button 
            type="button"
            onClick={() => {
              setIsTextToSpeechActive(!isTextToSpeechActive)
              if (currentlySpeakingId) window.speechSynthesis.cancel()
            }}
            className={cn(
              "p-2 transition-all border rounded-lg cursor-pointer shrink-0 hidden xs:block", 
              isTextToSpeechActive 
                ? "text-[#3b82f6] bg-[#3b82f6]/5 border-[#3b82f6]/10" 
                : "text-[#94a3b8]/30 bg-transparent border-white/5"
            )}
            title="Global Text-to-Speech Output Voice Feedback"
          >
            {isTextToSpeechActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Primary Action Emitter Button */}
          <Button
            size="icon"
            className="w-7 h-7 shrink-0 rounded-lg cursor-pointer"
            onClick={isStreaming ? stopStream : () => handleSend()}
            disabled={!isStreaming && !input.trim() && attachments.length === 0}
            variant={isStreaming ? 'destructive' : 'default'}
          >
            {isStreaming ? (
              <Square className="w-3 h-3 fill-current text-white" />
            ) : (
              <Send className="w-3 h-3 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  ) 
}