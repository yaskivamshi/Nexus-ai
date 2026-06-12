// frontend/src/store/pdfStore.js
// Manages state for the PDF chat feature
import { create } from 'zustand'

export const usePdfStore = create((set, get) => ({
  // The currently active PDF session
  activeSession: null,   // { collection_name, filename, page_count, chunk_count }

  // Chat history for the current PDF session
  messages: [],

  // Upload progress state
  isUploading: false,
  uploadProgress: 0,

  // Set the active PDF session after upload completes
  setActiveSession: (session) =>
    set({ activeSession: session, messages: [] }),

  // Add a message to the PDF chat
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  // Update the last message content (for streaming)
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
      }
      return { messages }
    }),

  setUploading: (v) => set({ isUploading: v }),
  setUploadProgress: (v) => set({ uploadProgress: v }),

  // Clear everything when user uploads a new PDF
  reset: () => set({ activeSession: null, messages: [], uploadProgress: 0 }),
}))