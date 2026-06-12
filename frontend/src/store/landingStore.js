// frontend/src/store/landingStore.js
import { create } from 'zustand'

export const useLandingStore = create((set) => ({
  activeModel: 'gpt-4o',
  setActiveModel: (model) => set({ activeModel: model }),
  
  // Interactive Chat State
  chatQuery: '',
  setChatQuery: (query) => set({ chatQuery: query }),
  isChatStreaming: false,
  setChatStreaming: (status) => set({ isChatStreaming: status }),
  
  // Document Showcase State
  uploadProgress: 0,
  isProcessingDoc: false,
  docAnalysisComplete: false,
  setUploadState: (states) => set((state) => ({ ...state, ...states })),

  // ATS Optimization State
  atsScore: 54,
  isOptimizingAts: false,
  setAtsState: (states) => set((state) => ({ ...state, ...states })),

  // Search Architecture State
  searchQuery: '',
  isSearchingWeb: false,
  searchComplete: false,
  setSearchState: (states) => set((state) => ({ ...state, ...states })),
}))