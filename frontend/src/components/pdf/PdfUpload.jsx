// frontend/src/components/pdf/PdfUpload.jsx
// Drag-and-drop PDF uploader with progress feedback
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, CheckCircle2, AlertCircle,
  Loader2, X, Info
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { usePdfStore } from '../../store/pdfStore'
import { useChatStore } from '../../store/chatStore'
import api from '../../api/client'

export default function PdfUpload({ onSessionReady }) {
  const { setActiveSession, setUploading, isUploading } = usePdfStore()
  const { selectedModel } = useChatStore()
  const [status, setStatus] = useState('idle')  // idle | uploading | processing | ready | error
  const [errorMsg, setErrorMsg] = useState('')
  const [stats, setStats] = useState(null)

  const uploadFile = async (file) => {
    setStatus('uploading')
    setUploading(true)
    setErrorMsg('')

    try {
      // Build FormData — required for file uploads
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', selectedModel)

      setStatus('processing')  // Uploading done, now embedding

      // POST to /api/pdf/upload
      const response = await api.post('/api/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Track upload progress (for the progress bar)
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          usePdfStore.getState().setUploadProgress(pct)
        },
      })

      const data = response.data
      setStats(data)

      // Save session info to store
      setActiveSession({
        collection_name: data.collection_name,
        filename: data.filename,
        page_count: data.page_count,
        chunk_count: data.chunk_count,
      })

      setStatus('ready')
      toast.success(`${data.filename} is ready — ${data.page_count} pages processed!`)
      onSessionReady?.(data)

    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setErrorMsg(msg)
      setStatus('error')
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  // react-dropzone setup
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return
      uploadFile(acceptedFiles[0])
    },
    [selectedModel]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,  // 20MB
    disabled: isUploading,
  })

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">

        {/* IDLE / DRAG STATE */}
        {(status === 'idle' || status === 'error') && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                'hover:border-primary/60 hover:bg-primary/5',
                isDragActive
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : status === 'error'
                  ? 'border-destructive/50 bg-destructive/5'
                  : 'border-border bg-muted/30'
              )}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center',
                  status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
                )}>
                  {status === 'error'
                    ? <AlertCircle className="w-8 h-8 text-destructive" />
                    : <FileText className="w-8 h-8 text-primary" />
                  }
                </div>

                {isDragActive ? (
                  <div>
                    <p className="font-semibold text-primary">Drop your PDF here</p>
                    <p className="text-sm text-muted-foreground mt-1">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">
                      {status === 'error' ? 'Upload failed — try again' : 'Upload a PDF'}
                    </p>
                    {status === 'error' && (
                      <p className="text-sm text-destructive mt-1">{errorMsg}</p>
                    )}
                    {status !== 'error' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag & drop or{' '}
                        <span className="text-primary underline">browse</span>
                        {' '}· Max 20MB
                      </p>
                    )}
                  </div>
                )}

                <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                  <Upload className="w-4 h-4" />
                  Choose file
                </Button>
              </div>
            </div>

            {/* Info note below dropzone */}
            <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Your PDF is processed locally. Text is extracted, chunked, and embedded
                using sentence-transformers. No data is sent to external servers during
                ingestion.
              </span>
            </div>
          </motion.div>
        )}

        {/* UPLOADING / PROCESSING STATE */}
        {(status === 'uploading' || status === 'processing') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border border-border rounded-2xl p-8 text-center bg-card"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-semibold">
                  {status === 'uploading' ? 'Uploading PDF...' : 'Processing PDF...'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {status === 'processing'
                    ? 'Extracting text, creating chunks, generating embeddings...'
                    : 'Sending file to server...'
                  }
                </p>
              </div>

              {/* Processing steps shown as a mini checklist */}
              <div className="w-full space-y-2 text-left">
                {[
                  { label: 'Extract text from pages', done: status === 'processing' },
                  { label: 'Split into smart chunks', done: status === 'processing' },
                  { label: 'Generate embeddings', done: false },
                  { label: 'Store in vector database', done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-muted-foreground shrink-0 animate-spin" />
                    )}
                    <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* READY STATE */}
        {status === 'ready' && stats && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-green-200 dark:border-green-800 rounded-2xl p-6 bg-green-50/50 dark:bg-green-950/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{stats.filename}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stats.message}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {stats.page_count} pages
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {stats.chunk_count} chunks
                  </Badge>
                  <Badge className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Ready to chat
                  </Badge>
                </div>
              </div>
              {/* Allow uploading a new file */}
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 shrink-0"
                onClick={() => {
                  usePdfStore.getState().reset()
                  setStatus('idle')
                  setStats(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}