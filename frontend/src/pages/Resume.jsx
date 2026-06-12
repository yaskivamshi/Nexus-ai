// frontend/src/pages/Resume.jsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
// frontend/src/pages/Resume.jsx (Top Imports)
import {
  FileText, Upload, Wand2, Download, RefreshCw,
  Loader2, CheckCircle2, Sparkles, Copy, Check,
  ChevronRight, Square, AlertCircle, XCircle, Lightbulb, Briefcase,
  Terminal // ◄ ADD THIS IMPORT RIGHT HERE
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import { useResumeStore } from '../store/resumeStore'
import { useResumeStream } from '../hooks/useResumeStream'
import { useChatStore } from '../store/chatStore'
import AtsScoreRing from '../components/resume/AtsScoreRing'
import api from '../api/client'

const STEPS = ['Upload', 'Analyze', 'Rewrite', 'Export']

// ── SCORE BAR COMPONENT ───────────────────────────────────────────────────────
function ScoreBar({ label, score, weight }) {
  const color =
    score >= 80 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
    : score >= 60 ? 'bg-blue-500 shadow-sm shadow-blue-500/20'
    : score >= 40 ? 'bg-amber-500 shadow-sm shadow-amber-500/20'
    : 'bg-rose-500 shadow-sm shadow-rose-500/20'

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex justify-between text-xs">
        <span className="text-[#94a3b8] font-medium">{label}</span>
        <span className="font-mono text-[#cbd5e1] font-semibold">
          {score}<span className="text-[#94a3b8]/40 font-normal"> / 100 · {weight}%</span>
        </span>
      </div>
      <div className="h-2 bg-[#020617] rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

// ── KEYWORD BADGE LIST ────────────────────────────────────────────────────────
function KeywordList({ keywords, variant = 'matched' }) {
  const isMatched = variant === 'matched'
  if (!keywords?.length)
    return <p className="text-xs text-[#94a3b8]/50 italic text-left">No operational tokens identified</p>

  return (
    <div className="flex flex-wrap gap-1.5 justify-start">
      {keywords.slice(0, 25).map((kw) => (
        <Badge
          key={kw}
          className={`text-[11px] font-mono border font-medium px-2 py-0.5 rounded-md ${
            isMatched
              ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-sm'
              : 'bg-rose-500/5 text-rose-400 border-rose-500/20 shadow-sm'
          }`}
        >
          {isMatched ? `+ ${kw}` : `- ${kw}`}
        </Badge>
      ))}
    </div>
  )
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────
export default function ResumePage() {
  const store = useResumeStore()
  const { selectedModel } = useChatStore()
  const { startRewrite, cancelRewrite } = useResumeStream()
  const [copied, setCopied] = useState(false)

  const stepIdx = ['upload', 'analyze', 'rewrite', 'done'].indexOf(store.step)

  // ── FILE UPLOAD PARSING PIPELINE ───────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    store.reset()
    store.setUploadedFile({ name: file.name, size: file.size })
    store.setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/api/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      store.setResumeText(data.text)
      toast.success(`Text extracted cleanly`)
    } catch (e) {
      const errMsg = e.response?.data?.detail || e.message || 'PDF processing failure.'
      store.setUploadError(errMsg)
      toast.error(`Upload failed: ${errMsg}`)
    } finally {
      store.setIsUploading(false)
    }
  }, [store])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: store.isUploading,
  })

  // ── KEYWORD MATCH MATRIX EVALUATION ────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!store.resumeText) return toast.error('Please drop your active resume vector first.')
    if (!store.jobDescription.trim()) return toast.error('Job parameters description entry is mandatory.')
    
    store.setIsAnalyzing(true)
    try {
      const { data } = await api.post('/api/resume/analyze', {
        resume_text: store.resumeText,
        job_description: store.jobDescription,
        model: selectedModel || 'openrouter/free'
      })
      
      store.setAnalysisResult(data)
      toast.success(`Scoring execution blueprint generated`)
    } catch (e) {
      const errMsg = e.response?.data?.detail || e.message || 'Scoring pipeline timed out.'
      store.setAnalysisError(errMsg)
      toast.error(`Analysis failed: ${errMsg}`)
    }
  }

  // ── SAFE BINARY EXPORTER PATH ──────────────────────────────────────────────
  const handleExport = async (format) => {
    try {
      const response = await api.post(
        '/api/resume/export',
        { resume_content: store.rewrittenResume, format },
        { responseType: 'blob' }
      )
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `optimized_resume.${format}`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success(`Successfully compiled .${format.toUpperCase()}`)
    } catch (e) {
      toast.error('Exporter token composition failed.')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(store.rewrittenResume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#020617] text-[#f8fafc] scrollbar-none">
      <div className="max-w-5xl mx-auto p-5 sm:p-6 space-y-6">

        {/* Header Functional Hud Title Block */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/5 pb-4 text-left">
          <div className="space-y-1">
            <h1 className="text-base font-bold flex items-center gap-2 text-white font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#3b82f6]" />
              ATS Evaluation Cluster
            </h1>
            <p className="text-xs text-[#94a3b8] font-normal leading-relaxed">
              Inject strategic structural keywords directly into context pathways to align with corporate tracking engine parameters.
            </p>
          </div>
          {store.step !== 'upload' && (
            <Button variant="outline" size="sm" onClick={() => store.reset()} className="gap-1.5 text-xs h-8 rounded-lg bg-[#111827] border-white/10 text-white hover:bg-[#1e293b]">
              <RefreshCw className="w-3.5 h-3.5" /> Start New Pipeline
            </Button>
          )}
        </div>

        {/* Stepper Progress Tracking Nodes layout */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 shrink-0">
              <span className={`
                flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg
                transition-all border font-mono uppercase tracking-wider
                ${i <= stepIdx 
                  ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/30 shadow-sm' 
                  : 'bg-[#111827]/40 text-[#94a3b8]/40 border-white/5'}
              `}>
                {i < stepIdx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                ) : (
                  <span className="w-3.5 text-center text-[10px] font-bold">{i + 1}</span>
                )}
                {label}
              </span>
              {i < 3 && <ChevronRight className="w-3 h-3 text-[#94a3b8]/20" />}
            </div>
          ))}
        </div>

        {/* ── SPLIT INPUT PANEL COMPONENT FRAMEWORK ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Resume Upload Sandbox Card Container */}
          <Card className="bg-[#111827]/40 border-white/5 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/5 bg-[#0b0f19]/40 text-left py-3 px-4">
              <CardTitle className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#3b82f6]" /> 1. Source Vector Ingestion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-center">
              {store.resumeText && !store.isUploading ? (
                <div className="space-y-4 w-full">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-left">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{store.uploadedFile?.name}</p>
                      <p className="text-[10px] font-mono text-emerald-400/70 mt-0.5">
                        ~{store.resumeText.split(/\s+/).length} words parsed cleanly
                      </p>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-28 border border-white/5 rounded-xl p-3 bg-[#020617]/50 text-left">
                    <p className="text-[11px] text-[#cbd5e1] whitespace-pre-wrap font-mono leading-relaxed select-text">
                      {store.resumeText.slice(0, 360)}…
                    </p>
                  </ScrollArea>
                  
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-9 rounded-xl bg-[#111827] border-white/10 text-white hover:bg-[#1e293b]" onClick={() => store.reset()}>
                    <Upload className="w-3.5 h-3.5" /> Re-ingest Source Document
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all min-h-[190px] flex items-center justify-center
                    ${isDragActive ? 'border-[#3b82f6] bg-[#3b82f6]/5 scale-[0.99]' : ''}
                    ${store.uploadError ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/10 hover:border-[#3b82f6]/40 hover:bg-[#0b0f19]/40'}
                    ${store.isUploading ? 'opacity-40 pointer-events-none' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2.5">
                    {store.isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
                    ) : store.uploadError ? (
                      <AlertCircle className="w-8 h-8 text-rose-400" />
                    ) : (
                      <Upload className="w-8 h-8 text-[#94a3b8]/40 group-hover:text-[#3b82f6] transition-colors" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {store.isUploading ? 'Extracting contextual character weights…'
                          : store.uploadError ? 'Parsing handshake loop failed'
                          : isDragActive ? 'Drop target file context'
                          : 'Drop source resume payload'}
                      </p>
                      {store.uploadError ? (
                        <p className="text-[10px] text-rose-400 mt-1 font-mono">{store.uploadError}</p>
                      ) : (
                        <p className="text-[10px] text-[#94a3b8]/40 mt-1 font-mono">PDF formats up to 10MB clusters</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Target Parameter Specifications Area Card */}
          <Card className="bg-[#111827]/40 border-white/5 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/5 bg-[#0b0f19]/40 text-left py-3 px-4">
              <CardTitle className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#3b82f6]" /> 2. Job Framework Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                placeholder="Paste structural target job expectations, platform skills, or operational requirements to execute deep matrix scoring validations..."
                value={store.jobDescription}
                onChange={(e) => store.setJobDescription(e.target.value)}
                className="h-44 resize-none text-xs bg-[#020617]/50 border-white/5 rounded-xl text-slate-200 placeholder-[#94a3b8]/20 focus-visible:ring-0 focus-visible:border-[#3b82f6]/40 focus:outline-none p-3 font-normal text-left"
              />
              <div className="text-[11px] text-[#94a3b8]/50 font-mono mt-2 text-left flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#94a3b8]/30" />
                <span>
                  {store.jobDescription.length > 0
                    ? `${store.jobDescription.split(/\s+/).filter(Boolean).length} keyword tokens parsed`
                    : 'Awaiting alignment parameters description.'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Computation Dispatch Trigger CTA Button */}
        {store.step === 'upload' && (
          <Button
            onClick={handleAnalyze}
            disabled={!store.resumeText || !store.jobDescription.trim() || store.isAnalyzing}
            className="w-full h-10 bg-[#3b82f6] hover:bg-[#3b82f6]/90 disabled:opacity-30 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#3b82f6]/10 cursor-pointer pt-0.5"
            size="lg"
          >
            {store.isAnalyzing ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling cross-reference loops…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Initialize Operational Matrix Analysis</>
            )}
          </Button>
        )}

        {/* ── METRIC GRIDS & ANALYTICS RING SECTION ── */}
        <AnimatePresence>
          {store.atsScore !== null && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <Card className="bg-[#111827]/40 border-white/5 backdrop-blur-md p-5 shadow-xl">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start w-full">
                    <div className="shrink-0 bg-[#020617]/40 border border-white/5 p-4 rounded-xl shadow-inner flex flex-col items-center justify-center min-w-[140px]">
                      <AtsScoreRing score={store.atsScore} />
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#94a3b8]/50 mt-2 block">System Rating</span>
                    </div>

                    <div className="flex-1 w-full space-y-4 pt-2">
                      <ScoreBar label="Keyword Context Alignment Matrix" score={store.atsScore} weight={60} />
                      <ScoreBar label="Structural Formatting Continuity Check" score={store.atsScore > 40 ? 92 : 54} weight={40} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Vector Badge Layout Grid Splits */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Card className="bg-[#111827]/30 border-white/5 overflow-hidden shadow-lg flex flex-col justify-between">
                  <CardHeader className="pb-2 border-b border-white/5 bg-[#0b0f19]/30 py-2.5 px-4 text-left">
                    <CardTitle className="text-[11px] font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Alignment Tokens ({store.matchedKeywords?.length ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <ScrollArea className="max-h-[140px] pr-1">
                      <KeywordList keywords={store.matchedKeywords} variant="matched" />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-[#111827]/30 border-white/5 overflow-hidden shadow-lg flex flex-col justify-between">
                  <CardHeader className="pb-2 border-b border-white/5 bg-[#0b0f19]/30 py-2.5 px-4 text-left">
                    <CardTitle className="text-[11px] font-bold font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Missing Keyword Vector Targets ({store.missingKeywords?.length ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <ScrollArea className="max-h-[140px] pr-1">
                      <KeywordList keywords={store.missingKeywords} variant="missing" />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Segment Validation Checks Grid Panels */}
              <Card className="bg-[#111827]/20 border-white/5 shadow-md overflow-hidden">
                <CardHeader className="pb-2 border-b border-white/5 bg-[#0b0f19]/20 py-2 px-4 text-left">
                  <CardTitle className="text-[10px] font-bold font-mono text-[#94a3b8]/60 uppercase tracking-widest">Core Document Segment Checklist</CardTitle>
                </CardHeader>
                <CardContent className="p-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                    {['summary', 'experience', 'education', 'skills', 'contact', 'projects'].map((section) => {
                      const exists = store.resumeText.toLowerCase().includes(section)
                      return (
                        <div key={section} className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border text-left ${exists ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/5 text-rose-400 border-rose-500/10'}`}>
                          {exists ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span className="capitalize text-[11px] truncate">{section}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Action Dispatch Trigger Line */}
              {store.step === 'analyze' && (
                <Button onClick={startRewrite} className="w-full h-11 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:opacity-95 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer" size="lg">
                  <Wand2 className="w-3.5 h-3.5 animate-pulse" /> Inject Missing Keywords & Optimize Copy Block
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── REALTIME TEXT STREAM OUTPUT CANVAS BLOCK ── */}
        <AnimatePresence>
          {(store.isRewriting || store.rewrittenResume) && (
            <motion.div
              key="rewrite"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-[#111827]/40 border-white/5 shadow-2xl backdrop-blur-sm overflow-hidden text-left">
                <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-3 border-b border-white/5 bg-[#0b0f19]/50 py-3 px-5">
                  <CardTitle className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                    {store.isRewriting ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#3b82f6]" /> Telemetry stream rendering tokens…</>
                    ) : store.rewriteError ? (
                      <><AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Pipeline connection disruption</>
                    ) : (
                      <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ATS Optimized Profile Asset</>
                    )}
                  </CardTitle>

                  {/* Refined Functional Exporter Button Matrix Row */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {store.isRewriting && (
                      <Button variant="destructive" size="sm" onClick={cancelRewrite} className="gap-1.5 text-[11px] font-mono h-8 rounded-lg cursor-pointer font-bold uppercase tracking-wide">
                        <Square className="w-3 h-3 fill-current" /> Terminate Stream
                      </Button>
                    )}
                    {store.rewriteDone && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-[11px] font-mono h-8 rounded-lg bg-[#111827] border-white/10 text-white hover:bg-[#1e293b] cursor-pointer">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy Plain'}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('docx')} className="gap-1.5 text-[11px] font-mono h-8 rounded-lg bg-[#111827] border-white/10 text-white hover:bg-[#1e293b] cursor-pointer">
                          <Download className="w-3.5 h-3.5 text-[#3b82f6]" /> <span>DOCX</span>
                        </Button>
                        <Button size="sm" onClick={() => handleExport('pdf')} className="gap-1.5 text-[11px] font-mono h-8 rounded-lg bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white cursor-pointer font-bold">
                          <Download className="w-3.5 h-3.5" /> <span>PDF Export</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 bg-[#020617]/40">
                  {store.rewriteError ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs leading-relaxed text-[#cbd5e1]">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Network connection broken mid-stream</p>
                          <p className="text-[#94a3b8]/60 mt-1 font-mono">{store.rewriteError}</p>
                        </div>
                      </div>
                      <Button onClick={startRewrite} variant="outline" className="w-full gap-2 text-xs h-9 rounded-xl border-white/10 text-white bg-[#111827] hover:bg-[#1e293b]">
                        <RefreshCw className="w-3.5 h-3.5" /> Re-fire Optimization Stream Channels
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[460px] pr-3 select-text">
                      {/* CRITICAL CONTRAST FIX: Forces responsive clean white text values */}
                      <div className="prose prose-sm max-w-none space-y-3 pr-2 text-left
                        prose-p:text-[#e2e8f0] prose-p:leading-relaxed prose-p:font-normal prose-p:text-xs sm:prose-p:text-sm
                        prose-headings:text-white prose-headings:font-bold prose-headings:mt-5 prose-headings:mb-2
                        prose-strong:text-[#3b82f6] prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5 prose-li:text-[#cbd5e1] prose-li:text-xs sm:prose-li:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {store.rewrittenResume || ' '}
                        </ReactMarkdown>
                      </div>
                      {store.isRewriting && (
                        <span className="inline-block w-1.5 h-4 bg-[#3b82f6] rounded-sm animate-pulse ml-0.5 align-middle" />
                      )}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}