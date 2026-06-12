// frontend/src/pages/Voice.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Volume2, Sparkles, Loader2, Radio } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { toast } from 'react-hot-toast'
import { useStream } from '../hooks/useStream'
import { useChatStore } from '../store/chatStore'

export default function Voice() {
  const { selectedModel } = useChatStore()
  const { streamChat, stopStream } = useStream()
  
  const [voiceState, setVoiceState] = useState('idle') // 'idle' | 'wake_listening' | 'listening' | 'processing' | 'speaking'
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isWakeWordActive, setIsWakeWordActive] = useState(false)
  
  const mainRecognitionRef = useRef(null)
  const wakeWordRecognitionRef = useRef(null)
  const accumulatedResponseRef = useRef('')

  // ── 1. BACKGROUND WAKE WORD LISTENER ──
  const startWakeWordListener = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Ensure any previously orphaned background instance is closed down first
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.onend = null;
        wakeWordRecognitionRef.current.abort();
      } catch (e) { /* ignore safe reset */ }
    }

    const wakeRec = new SpeechRecognition()
    wakeRec.continuous = true
    wakeRec.interimResults = true
    wakeRec.lang = 'en-US'

    wakeRec.onstart = () => {
      setVoiceState('wake_listening')
    }

    wakeRec.onresult = (event) => {
      const currentResultIndex = event.resultIndex
      const resultText = event.results[currentResultIndex][0].transcript.toLowerCase()
      
      if (resultText.includes('hey nexus') || resultText.includes('nexus')) {
        // Safe Detach Pattern: Strip out events before aborting to avoid continuous recursion triggers
        wakeRec.onend = null;
        wakeRec.onerror = null;
        wakeRec.abort() 
        triggerWakeResponse()
      }
    }

    wakeRec.onend = () => {
      if (isWakeWordActive && mainRecognitionRef.current && voiceState !== 'listening') {
        try { wakeRec.start() } catch { /* fail-safe check */ }
      }
    }

    wakeRec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        toast.error("Microphone hardware access blocked.")
        setIsWakeWordActive(false)
        setVoiceState('idle')
      }
    }

    wakeWordRecognitionRef.current = wakeRec
    try { wakeRec.start() } catch (err) { console.error(err) }
  }

  // ── 2. WAKE RESPONSE AND INTERACTIVE AUDIO TRANSITION ──
  const triggerWakeResponse = () => {
    setVoiceState('speaking')
    const initialGreeting = 'Hi there! I am listening, what can I do for you today?'
    setAiResponse(initialGreeting)
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const greeting = new SpeechSynthesisUtterance(initialGreeting)
      greeting.onend = () => {
        startMainSpeechCapture()
      }
      greeting.onerror = () => {
        startMainSpeechCapture()
      }
      window.speechSynthesis.speak(greeting)
    } else {
      startMainSpeechCapture()
    }
  }

  const startMainSpeechCapture = () => {
    if (mainRecognitionRef.current) {
      setVoiceState('listening')
      try { 
        mainRecognitionRef.current.start() 
      } catch (e) { 
        console.error(e)
        // Fallback loop back to wake sensor safely if main engine fails to bind
        startWakeWordListener()
      }
    }
  }

  // ── 3. LIVE AI PRODUCTION STREAMING HANDSHAKE ──
  const processUserVoiceQuery = async (spokenText) => {
    setVoiceState('processing')
    accumulatedResponseRef.current = ''
    setAiResponse('')

    const messageHistory = [{ role: 'user', content: spokenText }]

    await streamChat({
      messages: messageHistory,
      model: selectedModel,
      onToken: (token) => {
        accumulatedResponseRef.current += token
        setAiResponse(accumulatedResponseRef.current)
      },
      onDone: () => {
        setVoiceState('speaking')
        speakTextResponse(accumulatedResponseRef.current)
      },
      onError: (err) => {
        toast.error('Failed to contact Nexus AI Core.')
        setVoiceState('wake_listening')
        startWakeWordListener()
      }
    })
  }

  const speakTextResponse = (textToSpeak) => {
    if (!window.speechSynthesis) {
      setVoiceState('wake_listening')
      startWakeWordListener()
      return
    }

    window.speechSynthesis.cancel() 
    
    const cleanSpeechString = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanSpeechString)
    
    utterance.onend = () => {
      if (isWakeWordActive) {
        startWakeWordListener()
      } else {
        setVoiceState('idle')
      }
    }

    utterance.onerror = () => {
      if (isWakeWordActive) {
        startWakeWordListener()
      } else {
        setVoiceState('idle')
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  // ── 4. STANDARD VOICE CAPTURE CONFIGURATIONS ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const mainRec = new SpeechRecognition()
    mainRec.continuous = false
    mainRec.interimResults = false
    mainRec.lang = 'en-US'

    mainRec.onstart = () => {
      setTranscript('')
    }

    mainRec.onresult = (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      
      // Clear hooks before calling stop sequence closures
      mainRec.onend = null;
      mainRec.abort()
      processUserVoiceQuery(text) 
    }

    mainRec.onerror = (e) => {
      console.error("Main capture error:", e)
      if (isWakeWordActive) {
        startWakeWordListener()
      }
    }

    mainRec.onend = () => {
      if (isWakeWordActive) {
        startWakeWordListener()
      }
    }

    mainRecognitionRef.current = mainRec

    return () => {
      mainRec.onstart = null;
      mainRec.onresult = null;
      mainRec.onerror = null;
      mainRec.onend = null;
    }
  }, [isWakeWordActive, selectedModel])

  // ── 5. FIXED HARDWARE TOGGLE SHUTDOWN ENGINE ──
  const toggleSystemState = () => {
    if (isWakeWordActive) {
      // ORDER OF OPERATIONS FIX: Set tracking status to false first to stop re-initialization tracks
      setIsWakeWordActive(false)
      setVoiceState('idle')
      stopStream()
      
      // Clear trailing visualization cards text context
      setTranscript('')
      setAiResponse('')

      // 1. Unbind and terminate Wake Engine instantly
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.onend = null;
        wakeWordRecognitionRef.current.onerror = null;
        wakeWordRecognitionRef.current.onresult = null;
        try { wakeWordRecognitionRef.current.abort() } catch (e) {}
        wakeWordRecognitionRef.current = null;
      }

      // 2. Unbind and terminate Active Voice Capture Engine instantly
      if (mainRecognitionRef.current) {
        mainRecognitionRef.current.onend = null;
        mainRecognitionRef.current.onerror = null;
        mainRecognitionRef.current.onresult = null;
        try { mainRecognitionRef.current.abort() } catch (e) {}
      }

      // 3. Silence lingering Text-To-Speech queues
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel() } catch (e) {}
      }
      
      toast.dismiss()
      toast('Radar disabled cleanly.', { icon: '🛑' })
    } else {
      setIsWakeWordActive(true)
      // Directly invoke trigger loop using target status configuration contexts
      setTimeout(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
          toast.error("Speech Recognition API not supported in this browser header profile.")
          setIsWakeWordActive(false)
          return
        }
        startWakeWordListener()
        toast.success('Nexus background radar active!')
      }, 50)
    }
  }

  // Structural component cleanup block on view transitions
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.onend = null;
        try { wakeWordRecognitionRef.current.abort() } catch (e) {}
      }
      if (mainRecognitionRef.current) {
        mainRecognitionRef.current.onend = null;
        try { mainRecognitionRef.current.abort() } catch (e) {}
      }
    }
  }, [])

  return (
    <div className="w-full min-h-full bg-[#09090b] text-[#fafafa] p-6 flex flex-col justify-between overflow-y-auto select-none">
      
      <div className="border-b border-[#27272a]/40 pb-4 text-left">
        <h1 className="text-xs font-medium text-[#71717a] tracking-wider uppercase font-mono">Hands-Free Assistant</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-12 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[#3b82f6] mx-auto shadow-sm">
            <Radio className={cn("w-4 h-4", isWakeWordActive && "text-green-400 animate-pulse")} />
          </div>
          <h2 className="text-xl font-medium tracking-tight text-[#fafafa]">Continuous Wake Word Mode</h2>
          <p className="text-xs text-[#71717a]">Activate the radar, then speak "Hey Nexus" at any time</p>
        </div>

        {/* Outer Ring System Animations */}
        <div className="relative flex items-center justify-center w-48 h-48">
          <AnimatePresence>
            {isWakeWordActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: voiceState === 'listening' ? [0.2, 0.05, 0.2] : 0.08, 
                  scale: voiceState === 'listening' ? [1, 1.4, 1] : 1.1 
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className={cn(
                  "absolute inset-0 rounded-full bg-[#3b82f6]/20 border",
                  voiceState === 'listening' ? "border-green-500/30 bg-green-500/5" : "border-[#3b82f6]/30"
                )}
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleSystemState}
            className={cn(
              "w-24 h-24 rounded-full flex flex-col items-center justify-center border transition-all duration-300 z-10 shadow-md",
              isWakeWordActive && voiceState === 'wake_listening' && "bg-green-500/5 border-green-500/30 text-green-400",
              isWakeWordActive && voiceState === 'listening' && "bg-blue-500/10 border-blue-500/40 text-blue-400",
              isWakeWordActive && voiceState === 'processing' && "bg-purple-500/5 border-purple-500/30 text-purple-400",
              !isWakeWordActive && "bg-[#121214] border-[#27272a] text-[#71717a] hover:border-[#27272a]/80"
            )}
          >
            {isWakeWordActive ? (
              <Square className="w-4 h-4 text-red-400 fill-current" />
            ) : (
              <Mic className="w-6 h-6 text-[#3b82f6]" />
            )}
          </motion.button>
        </div>

        {/* Live HUD Status Readout Text line */}
        <div className="h-6 flex items-center justify-center text-xs font-medium tracking-wide">
          {voiceState === 'idle' && <span className="text-[#71717a]">Click node to initialize wake sensor</span>}
          {voiceState === 'wake_listening' && <span className="text-green-400 animate-pulse flex items-center gap-1.5">📡 Radar active: Say "Hey Nexus"...</span>}
          {voiceState === 'listening' && <span className="text-blue-400 animate-pulse flex items-center gap-1.5">🎙️ Capture active: Speak your command...</span>}
          {voiceState === 'processing' && <span className="text-purple-400 flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Querying active models over stream...</span>}
          {voiceState === 'speaking' && <span className="text-cyan-400 flex items-center gap-1.5"><Volume2 className="w-3 h-3 animate-bounce" /> Streaming voice output audio...</span>}
        </div>

        {/* Live Transcripts Cards viewport panel display */}
        <AnimatePresence>
          {(transcript || aiResponse) && (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="w-full space-y-3 bg-[#121214] border border-[#27272a] rounded-xl p-4 text-left"
            >
              {transcript && (
                <div>
                  <p className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider">Captured Query</p>
                  <p className="text-xs text-[#fafafa] font-normal leading-relaxed">{transcript}</p>
                </div>
              )}
              {transcript && aiResponse && <div className="h-[1px] bg-[#27272a]/40" />}
              {aiResponse && (
                <div>
                  <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">Nexus Engine</p>
                  <p className="text-xs text-[#fafafa]/90 font-normal leading-relaxed max-h-40 overflow-y-auto">{aiResponse}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Instructional Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#27272a]/30">
        {[
          { num: '1', title: 'Initialize', desc: 'Click mic to turn on continuous sensor radar' },
          { num: '2', title: 'Call "Hey Nexus"', desc: 'System wakes up instantly and replies "Hi there!"' },
          { num: '3', title: 'Live Answers', desc: 'Speak commands and hear deep live streaming generation' }
        ].map((step) => (
          <Card key={step.num} className="bg-[#121214] border border-[#27272a] rounded-xl p-4">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-5 h-5 rounded-full bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[10px] font-mono text-[#3b82f6] font-bold">
                {step.num}
              </div>
              <h4 className="text-xs font-medium text-[#fafafa]">{step.title}</h4>
              <p className="text-[11px] text-[#71717a] leading-tight">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}