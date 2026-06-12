// frontend/src/components/voice/VoiceButton.jsx
//
// Uses the browser's built-in Web Speech API — no external API needed.
// SpeechRecognition: converts microphone input to text
// SpeechSynthesis: reads text aloud
//
import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { toast } from 'react-hot-toast'
import { cn } from '../../lib/utils'

// Check browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

export default function VoiceButton({ onTranscript, textToSpeak }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const recognitionRef = useRef(null)

  // Auto-speak when new AI text arrives (if TTS is enabled)
  useEffect(() => {
    if (ttsEnabled && textToSpeak && !isSpeaking) {
      speak(textToSpeak)
    }
  }, [textToSpeak, ttsEnabled])

  // Initialize speech recognition
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false      // stop after one sentence
    recognition.interimResults = true   // show partial results while speaking
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')

      // Only fire callback on final result (not interim)
      if (event.results[0].isFinal) {
        onTranscript?.(transcript)
        setIsListening(false)
      }
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        toast.error(`Voice error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)
    recognition.start()
  }, [onTranscript])

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // Text-to-speech
  const speak = (text) => {
    if (!window.speechSynthesis) return

    // Cancel any currently playing speech
    window.speechSynthesis.cancel()

    // Clean markdown before speaking
    const cleanText = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-•]\s/gm, '')
      .slice(0, 1000)    // TTS has limits

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Pick a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US'
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">

        {/* Microphone button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-8 h-8 transition-all',
                isListening && 'bg-red-100 dark:bg-red-950 text-red-600 animate-pulse'
              )}
              onClick={isListening ? stopListening : startListening}
            >
              {isListening
                ? <MicOff className="w-4 h-4" />
                : <Mic className="w-4 h-4" />
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isListening ? 'Stop listening' : 'Voice input'}
          </TooltipContent>
        </Tooltip>

        {/* TTS toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-8 h-8',
                isSpeaking && 'text-primary',
                ttsEnabled && 'text-primary'
              )}
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking()
                } else {
                  setTtsEnabled(!ttsEnabled)
                  if (!ttsEnabled) toast.success('Text-to-speech enabled')
                }
              }}
            >
              {ttsEnabled || isSpeaking
                ? <Volume2 className="w-4 h-4" />
                : <VolumeX className="w-4 h-4" />
              }
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSpeaking ? 'Stop speaking' : ttsEnabled ? 'Disable TTS' : 'Enable TTS'}
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  )
}