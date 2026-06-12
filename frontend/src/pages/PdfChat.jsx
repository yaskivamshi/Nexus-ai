// frontend/src/pages/PdfChat.jsx
// The full PDF Chat page — upload panel + chat panel side by side
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import PdfUpload from '../components/pdf/PdfUpload'
import PdfChatComponent from '../components/pdf/PdfChat'
import { usePdfStore } from '../store/pdfStore'

export default function PdfChatPage() {
  const { activeSession } = usePdfStore()

  return (
    <div className="flex h-full">

      {/* Left panel: upload + session info */}
      <div className={`
        flex flex-col border-r border-border bg-muted/20
        transition-all duration-300
        ${activeSession ? 'w-80 shrink-0' : 'flex-1'}
      `}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-semibold text-sm">PDF Chat</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a PDF and ask questions about it using AI.
          </p>
        </div>

        <div className={`flex-1 flex items-center justify-center p-6 ${activeSession ? 'items-start pt-6' : ''}`}>
          <PdfUpload />
        </div>

        {/* Feature list shown when no session active */}
        {!activeSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 border-t border-border"
          >
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              What you can do
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Ask questions about the content',
                'Summarize the entire document',
                'Extract skills from a resume',
                'Generate interview questions',
                'Explain specific sections',
                'Get cited, page-referenced answers',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Right panel: PDF chat (only shown when a PDF is loaded) */}
      {activeSession ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PdfChatComponent />
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-muted/10">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Upload a PDF to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}