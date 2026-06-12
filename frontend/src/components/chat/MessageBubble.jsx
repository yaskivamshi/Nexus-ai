// src/components/chat/MessageBubble.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Bot, User } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex w-full gap-4 px-6 py-4 transition-colors duration-150',
        isUser ? 'flex-row-reverse bg-transparent' : 'flex-row bg-transparent'
      )}
    >
      {/* High-Fidelity Circular Avatar Asset Badging */}
      <div className={cn(
        'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-colors select-none mt-0.5',
        isUser
          ? 'bg-[#1c1c1f] border-[#27272a] text-[#3b82f6]'
          : 'bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]'
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Geometrically aligned text block surfaces */}
      <div className={cn(
        'max-w-[78%] text-[14px] leading-relaxed font-normal text-[#fafafa]',
        isUser
          ? 'bg-[#1c1c1f] border border-[#27272a] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm'
          : 'pt-1 px-1 flex-1'
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap selection:bg-[#3b82f6]/30">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent selection:bg-[#3b82f6]/30">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeContent = String(children).replace(/\n$/, '')
                  const inline = !match && !codeContent.includes('\n')

                  if (inline) {
                    return (
                      <code className="bg-[#1c1c1f] text-[#3b82f6] px-1.5 py-0.5 rounded-md text-xs font-mono border border-[#27272a]" {...props}>
                        {children}
                      </code>
                    )
                  }

                  const detectedLanguage = match ? match[1] : 'javascript'

                  return (
                    <CodeBlock 
                      language={detectedLanguage} 
                      value={codeContent} 
                    />
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Premium Codeblock view configured with charcoal slate wrappers matching target mockups
function CodeBlock({ language, value }) {
  return (
    <div className="relative rounded-xl overflow-hidden my-3 border border-[#27272a] bg-[#121214] shadow-md">
      {/* Header bar metadata tab tracking */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121214] border-b border-[#27272a] text-xs select-none">
        <span className="font-mono font-medium text-xs text-[#71717a] tracking-normal lowercase">{language}</span>
      </div>
      <div className="p-4 overflow-x-auto bg-[#09090b]">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ 
            margin: 0, 
            padding: 0, 
            background: 'transparent', 
            fontSize: '13px', 
            lineHeight: '1.5',
            fontFamily: 'JetBrains Mono, Fira Code, monospace'
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}