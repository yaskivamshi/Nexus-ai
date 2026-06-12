
// frontend/src/store/resumeStore.js
import { create } from 'zustand'

const INITIAL_STATE = {
  // Step tracker (upload → analyze → rewrite → done)
  step: 'upload',
  
  // Data Extraction
  uploadedFile: null,
  resumeText: '',
  jobDescription: '',
  isUploading: false,
  uploadError: null,
  
  // Statistical Match Analysis Metrics
  atsScore: null,
  matchedKeywords: [],
  missingKeywords: [],
  isAnalyzing: false,
  analysisError: null,
  
  // AI Optimization Text Stream
  rewrittenResume: '',
  isRewriting: false,
  rewriteError: null,
  rewriteDone: false,
}

export const useResumeStore = create((set, get) => ({
  ...INITIAL_STATE,

  // UI Step Handlers
  setStep: (step) => set({ step }),

  // File Upload Handlers
  setUploadedFile: (file) => set({ uploadedFile: file, uploadError: null }),
  setResumeText: (text) => set({ resumeText: text }),
  setIsUploading: (value) => set({ isUploading: value }),
  setUploadError: (error) => set({ uploadError: error, isUploading: false }),
  setJobDescription: (text) => set({ jobDescription: text }),

  // Analysis / Scoring Processing Handlers
  setIsAnalyzing: (value) => set({ isAnalyzing: value, analysisError: null }),
  setAnalysisError: (error) => set({ analysisError: error, isAnalyzing: false }),
  setAnalysisResult: ({ ats_score, matched_keywords, missing_keywords }) =>
    set({ 
      atsScore: ats_score, 
      matchedKeywords: matched_keywords, 
      missingKeywords: missing_keywords,
      isAnalyzing: false,
      analysisError: null,
      step: 'analyze'
    }),

  // AI Rewrite Streaming Handling Methods
  setIsRewriting: (value) => set({ isRewriting: value }),
  setRewriteError: (error) => set({ rewriteError: error, isRewriting: false }),
  setRewrittenResume: (text) => set({ rewrittenResume: text }),
  
  startRewrite: () => set({
    rewrittenResume: '',
    isRewriting: true,
    rewriteError: null,
    rewriteDone: false,
    step: 'rewrite',
  }),

  // ROOT CAUSE FIX 2 (frontend side):
  // Reverses the \\n string escape the backend applied before sending SSE packets.
  appendRewrittenToken: (token) =>
    set((state) => {
      if (!token) return state;
      
      const cleanToken = token
        .replace(/\\n/g, '\n')     // Unrolls literal '\n' text into true formatting breaks
        .replace(/\\\\/g, '\\');   // Recovers single escaped backslashes safely
        
      return { rewrittenResume: state.rewrittenResume + cleanToken };
    }),

  finishRewrite: () => set({ isRewriting: false, rewriteDone: true, step: 'done' }),

  // Resets entire workflow back to initialization default baseline
  reset: () => set(INITIAL_STATE),
}))