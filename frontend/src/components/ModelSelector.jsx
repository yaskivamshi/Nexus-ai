// frontend/src/components/ModelSelector.jsx
import { useState, useEffect } from 'react'
import { ChevronDown, Cpu, Loader2 } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useChatStore } from '../store/chatStore'

// Static base configurations that aren't parsed dynamically from cloud discovery APIs
const STATIC_GROUPS = [
  {
    group: 'OpenRouter (100% Free Tiers)',
    models: [
      { id: 'openrouter/openrouter/free', label: 'Auto Free Mode (Highly Recommended)', badge: 'Dynamic' },
      { id: 'openrouter/meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free)', badge: '70B Cloud' },
      { id: 'openrouter/deepseek/deepseek-v4-flash:free', label: 'DeepSeek V4 Flash (Free)', badge: 'Ultra Fast' },
      { id: 'openrouter/google/gemini-flash-1.5-exp:free', label: 'Gemini 1.5 Flash (Free)', badge: 'Large Context' },
    ],
  },
  {
    group: 'Free (Ollama Local)',
    models: [
      { id: 'llama3', label: 'Llama 3 8B', badge: 'Local Full' },
      { id: 'phi3', label: 'Phi-3 3.8B', badge: 'Low RAM' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder', badge: 'Local Code' },
    ],
  },
]

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore()
  const [dynamicGroups, setDynamicGroups] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Fetch live NVIDIA NIM and Hugging Face models on component mount
  useEffect(() => {
    async function fetchLiveModels() {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:8000/api/chat/live-catalog')
        const data = await res.json()
        
        if (data.success && data.models) {
          // Separate and bundle incoming items by provider tags
          const nvidiaModels = data.models
            .filter((m) => m.provider === 'nvidia')
            .map((m) => ({ id: m.id, label: m.name, badge: 'NIM Cluster' }))

          const hfModels = data.models
            .filter((m) => m.provider === 'huggingface')
            .map((m) => ({ id: m.id, label: m.name, badge: 'HF Open' }))

          const discoveredGroups = []
          if (nvidiaModels.length > 0) {
            discoveredGroups.push({ group: 'NVIDIA NIM (Accelerated Open)', models: nvidiaModels })
          }
          if (hfModels.length > 0) {
            discoveredGroups.push({ group: 'Hugging Face (Free Serverless)', models: hfModels })
          }
          
          setDynamicGroups(discoveredGroups)
        }
      } catch (err) {
        console.error('Failed to sync live cloud catalogs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveModels()
  }, [])

  // 2. Merge static fallback definitions with live API responses
  const allGroups = [...STATIC_GROUPS, ...dynamicGroups]

  // 3. Resolve readable layout labels cleanly across merged data vectors
  const currentLabel = allGroups
    .flatMap((g) => g.models)
    .find((m) => m.id === selectedModel)?.label ?? 'Select Model'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-background">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-primary" />
          )}
          <span className="truncate max-w-[140px]">{currentLabel}</span>
          <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="center" className="w-64 max-h-[400px] overflow-y-auto bg-card border border-border unique-scrollbar">
        {allGroups.map((group) => (
          <div key={group.group}>
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5">
              {group.group}
            </DropdownMenuLabel>
            {group.models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`flex items-center justify-between cursor-pointer text-xs px-2 py-1.5 focus:bg-accent focus:text-accent-foreground ${
                  selectedModel === model.id ? 'bg-accent/40 font-medium' : ''
                }`}
              >
                <span className="truncate mr-2">{model.label}</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 border-0 bg-muted text-muted-foreground shrink-0">
                  {model.badge}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-border my-1" />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}