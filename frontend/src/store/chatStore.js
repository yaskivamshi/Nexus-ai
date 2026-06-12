// frontend/src/store/chatStore.js
import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  // List of all chat sessions
  chats: [],
  // The currently active chat ID
  activeChatId: null,
  
  // DEFAULT ROUTING LAYER: Fast, free global tier fallback parameter configuration
  selectedModel: 'openrouter/meta-llama/llama-3.3-70b-instruct:free',

  // HELPER SYSTEM: Handles targeted browser localStorage saves split up per user ID
  saveUserChats: (userId, updatedChats) => {
    if (!userId) return
    const key = `nexus-chat-storage_${userId}`
    localStorage.setItem(key, JSON.stringify(updatedChats))
  },

  // INITIALIZATION PIPELINE: Pulls down isolated cache partitions without cross-over leaks
  loadUserChats: (userId) => {
    if (!userId) {
      set({ chats: [], activeChatId: null })
      return
    }
    const key = `nexus-chat-storage_${userId}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsedChats = JSON.parse(saved)
        set({ 
          chats: parsedChats, 
          activeChatId: parsedChats.length > 0 ? parsedChats[0].id : null 
        })
      } catch (e) {
        console.error("Failed parsing user chat assets:", e)
        set({ chats: [], activeChatId: null })
      }
    } else {
      set({ chats: [], activeChatId: null })
    }
  },

  // Create a new chat session
  createChat: (userId) => {
    const id = crypto.randomUUID()
    const newChat = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    }
    
    set((state) => {
      const updatedChats = [newChat, ...state.chats]
      if (userId) get().saveUserChats(userId, updatedChats)
      return {
        chats: updatedChats,
        activeChatId: id,
      }
    })
    return id
  },

  // Get the currently active chat object
  getActiveChat: () => {
    const { chats, activeChatId } = get()
    return chats.find((c) => c.id === activeChatId) || null
  },

  // Add a message to the active chat
  addMessage: (chatId, message, userId) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
      if (userId) get().saveUserChats(userId, updatedChats)
      return { chats: updatedChats }
    })
  },

  // Update the last message (used for streaming — we append tokens)
  updateLastMessage: (chatId, content, userId) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) => {
        if (chat.id !== chatId) return chat
        const messages = [...chat.messages]
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        }
        return { ...chat, messages }
      })
      if (userId) get().saveUserChats(userId, updatedChats)
      return { chats: updatedChats }
    })
  },

  // Update chat title (auto-generated from first message)
  updateChatTitle: (chatId, title, userId) => {
    set((state) => {
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      )
      if (userId) get().saveUserChats(userId, updatedChats)
      return { chats: updatedChats }
    })
  },

  // Delete a chat
  deleteChat: (chatId, userId) => {
    set((state) => {
      const updatedChats = state.chats.filter((c) => c.id !== chatId)
      const nextActiveId = state.activeChatId === chatId ? (updatedChats.length > 0 ? updatedChats[0].id : null) : state.activeChatId
      if (userId) get().saveUserChats(userId, updatedChats)
      return {
        chats: updatedChats,
        activeChatId: nextActiveId,
      }
    })
  },

  setActiveChatId: (id) => set({ activeChatId: id }),
  setSelectedModel: (model) => set({ selectedModel: model || 'openrouter/meta-llama/llama-3.3-70b-instruct:free' }),

  // Clear UI state during logout so data doesn't leak on-screen
  clearChatStoreUI: () => set({ chats: [], activeChatId: null }),
}))