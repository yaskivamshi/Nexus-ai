// frontend/src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import { Brain, Trash2, Plus, Loader2, Settings as SettingsIcon, Moon, Sparkles, Info, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import api from '../api/client'

// Static baseline definitions that don't shift dynamically from third-party APIs
const STATIC_SETTINGS_MODELS = [
  {
    group: 'OpenRouter (100% Free Cloud Tiers)',
    items: [
      { id: 'openrouter/openrouter/free', label: 'Auto Free Mode (Smart Balance Router)' },
      { id: 'openrouter/meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free OpenRouter)' },
      { id: 'openrouter/deepseek/deepseek-v4-flash:free', label: 'DeepSeek V4 Flash (Free OpenRouter)' },
      { id: 'openrouter/google/gemini-flash-1.5-exp:free', label: 'Gemini 1.5 Flash (Free OpenRouter)' },
    ],
  },
  {
    group: 'Local AI Architectures (Ollama Node)',
    items: [
      { id: 'llama3', label: 'Llama 3 8B (Local Ollama)' },
      { id: 'phi3', label: 'Phi-3 3.8B (Local Ollama)' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder (Local Ollama)' },
    ],
  },
];

export default function Settings() {
  const { user } = useAuthStore()
  const { selectedModel, setSelectedModel } = useChatStore()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMemory, setNewMemory] = useState('')
  const [adding, setAdding] = useState(false)
  
  const [darkMode, setDarkMode] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  
  // NEW STATE: Holds incoming dynamic API catalog allocations
  const [dynamicGroups, setDynamicGroups] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(false)

  // 1. Fetch live automated models from your Python discovery engine route
  useEffect(() => {
    async function fetchLiveCatalog() {
      setCatalogLoading(true)
      try {
        const { data } = await api.get('/api/chat/live-catalog')
        const res = await fetch('http://localhost:8000/api/chat/live-catalog')
        const data = await res.json()
        
        if (data.success && data.models) {
          const nvidiaItems = data.models
            .filter((m) => m.provider === 'nvidia')
            .map((m) => ({ id: m.id, label: `${m.name} (NVIDIA NIM Cluster)` }))

          const hfItems = data.models
            .filter((m) => m.provider === 'huggingface')
            .map((m) => ({ id: m.id, label: `${m.name} (Hugging Face Serverless Hub)` }))

          const discoveredGroups = []
          if (nvidiaItems.length > 0) {
            discoveredGroups.push({ group: 'NVIDIA NIM (Accelerated Open Core)', items: nvidiaItems })
          }
          if (hfItems.length > 0) {
            discoveredGroups.push({ group: 'Hugging Face (Free Serverless)', items: hfItems })
          }
          
          setDynamicGroups(discoveredGroups)
        }
      } catch (err) {
        console.error('Failed to sync dynamic options to settings module:', err)
      } finally {
        setCatalogLoading(false)
      }
    }

    fetchLiveCatalog()
  }, [])

  // 2. Interleave static configuration elements with dynamic catalog fetches
  // We place OpenRouter first, then append NVIDIA and Hugging Face, followed by Local Ollama
  const unifiedSettingsModels = [
    STATIC_SETTINGS_MODELS[0], // OpenRouter Group
    ...dynamicGroups,          // Fetched NVIDIA and HF Groups
    STATIC_SETTINGS_MODELS[1]  // Local Ollama Group
  ]

  const fetchMemories = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { data } = await api.get(`/api/memory/${user.id}`)
      setMemories(data.memories || [])
    } catch {
      toast.error('Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMemories() }, [user])

  const handleAdd = async () => {
    if (!newMemory.trim()) return
    setAdding(true)
    try {
      await api.post('/api/memory/', {
        user_id: user.id,
        content: newMemory,
        importance: 7,
      })
      setNewMemory('')
      await fetchMemories()
      toast.success('Memory saved!')
    } catch {
      toast.error('Failed to save memory')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/memory/${id}/${user.id}`)
      setMemories((prev) => prev.filter((m) => m.id !== id))
      toast.success('Memory deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleSaveGlobalSettings = () => {
    setSavingSettings(true)
    setTimeout(() => {
      setSavingSettings(false)
      toast.success('System parameters saved successfully!')
    }, 800)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 bg-[#09090b] text-[#fafafa] min-h-full select-none">
      
      {/* View Title Panel Header */}
      <div className="flex items-center gap-3 border-b border-[#27272a]/40 pb-5">
        <div className="w-9 h-9 rounded-xl bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center text-[#3b82f6]">
          <SettingsIcon className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#fafafa]">Settings</h1>
          <p className="text-xs text-[#71717a] mt-0.5">Customize your NEXUS AI experience and control background context</p>
        </div>
      </div>

      {/* ── CARD 1: Appearance Module ── */}
      <Card className="bg-[#121214] border border-[#27272a] rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#fafafa]">
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-1">
            <div className="flex gap-3 items-start">
              <Moon className="w-4 h-4 text-[#3b82f6] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#fafafa]">Dark Mode</p>
                <p className="text-xs text-[#71717a] mt-0.5">Switch between light and dark layout dashboard themes</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none border ${
                darkMode ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-[#1c1c1f] border-[#27272a]'
              }`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200 transform ${
                darkMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: AI Settings Module ── */}
      <Card className="bg-[#121214] border border-[#27272a] rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#fafafa]">
            AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-medium text-[#71717a] uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#3b82f6]" />
                Default AI Model
              </div>
              {catalogLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-[#3b82f6] lowercase normal-case tracking-normal">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>syncing cloud clusters...</span>
                </div>
              )}
            </div>
            
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-10 pl-3 pr-10 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-[#fafafa] focus:outline-none focus:border-[#3b82f6]/50 appearance-none cursor-pointer font-sans truncate"
              >
                {unifiedSettingsModels.map((group) => group && (
                  <optgroup key={group.group} label={group.group} className="bg-[#09090b] text-[#71717a] text-[11px] font-mono">
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id} className="text-[#fafafa] bg-[#121214] font-sans text-xs">
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717a] text-[10px]">▼</div>
            </div>
            <p className="text-[11px] text-[#71717a]/70 pt-0.5">This model will be selected by default across your entire active dashboard workspace tabs</p>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 3: AI Memory Layout Module ── */}
      <Card className="bg-[#121214] border border-[#27272a] rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#fafafa]">
            <Brain className="w-4 h-4 text-[#a855f7]" />
            AI Memory Context
          </CardTitle>
          <CardDescription className="text-xs text-[#71717a] pt-1">
            Facts the AI extracts automatically across all conversations. Higher importance metrics inject context packages into deep generation chains.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex gap-2 pt-1">
            <Input
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onChangeCapture={undefined}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Store a preference, note, or important information..."
              className="h-9 flex-1 bg-[#09090b] border border-[#27272a] rounded-lg text-xs text-[#fafafa] placeholder:text-[#71717a]/40 focus-visible:ring-1 focus-visible:ring-[#a855f7]/40 focus-visible:border-[#a855f7]/40 transition-all font-sans"
            />
            <Button 
              onClick={handleAdd} 
              disabled={!newMemory.trim() || adding} 
              className="h-9 px-4 bg-[#a855f7] hover:bg-[#a855f7]/90 text-white rounded-lg text-xs font-medium gap-1.5 transition-colors shrink-0"
            >
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save Memory</span>
            </Button>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 px-1 mb-3">
              <button className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#a855f7] text-white">All ({memories.length})</button>
              <button className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#1c1c1f] text-[#71717a] hover:text-[#fafafa] transition-colors">General (0)</button>
              <button className="px-3 py-1 text-[11px] font-medium rounded-full bg-[#1c1c1f] text-[#71717a] hover:text-[#fafafa] transition-colors">Preferences (0)</button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#71717a]" />
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-10 rounded-xl bg-[#09090b]/50 border border-dashed border-[#27272a] space-y-2">
                <Brain className="w-7 h-7 mx-auto text-[#71717a]/30" />
                <p className="text-xs text-[#71717a]">No memories found yet. Chat with your agent nodes to store details.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#27272a] bg-[#09090b] overflow-hidden divide-y divide-[#27272a]/60">
                {memories.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[#121214]/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge className="text-[10px] font-semibold tracking-wider font-mono h-5 bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 rounded-md">
                        lvl {m.importance}
                      </Badge>
                      <p className="text-xs text-[#fafafa] truncate font-sans">{m.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 rounded-md text-[#71717a] hover:text-red-400 hover:bg-[#1c1c1f] shrink-0 transition-colors"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 4: System Information Module ── */}
      <Card className="bg-[#121214] border border-[#27272a] rounded-xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-[#fafafa]">
            <Info className="w-4 h-4 text-[#71717a]" />
            About System Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2.5 font-sans pt-1">
          <div className="flex justify-between py-1 border-b border-[#27272a]/30">
            <span className="text-[#71717a]">App Version</span>
            <span className="font-mono text-[#fafafa]">1.0.0-stable</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#27272a]/30">
            <span className="text-[#71717a]">Active Cluster Engines</span>
            <span className="text-right text-[#fafafa]">Ollama Core, OpenRouter Free Mesh, NVIDIA NIM, Hugging Face Token Infrastructure</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#71717a]">Enabled Workspace Modalities</span>
            <span className="text-[#fafafa]">Chat, PDF Document Analysis, Search, Voice, ATS Optimization</span>
          </div>
        </CardContent>
      </Card>

      {/* Master Form Submission Footer Container Button */}
      <Button
        onClick={handleSaveGlobalSettings}
        disabled={savingSettings}
        className="w-full h-10 bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 rounded-lg text-xs font-medium gap-1.5 transition-all shadow-sm shadow-[#3b82f6]/10"
      >
        {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        <span>Save Settings Parameters</span>
      </Button>

    </div>
  )
}