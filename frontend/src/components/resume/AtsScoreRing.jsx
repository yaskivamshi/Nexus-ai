// frontend/src/components/resume/AtsScoreRing.jsx
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react'

// Color changes based on score range
function getScoreColor(score) {
  if (score >= 80) return '#22c55e'   // green
  if (score >= 60) return '#f59e0b'   // amber
  if (score >= 40) return '#f97316'   // orange
  return '#ef4444'                     // red
}

function getScoreLabel(score) {
  if (score >= 80) return 'Ready to Apply'
  if (score >= 60) return 'Solid Match'
  if (score >= 40) return 'Needs Optimization'
  return 'Critical Rejection Risk'
}

function getPassLikelihood(score) {
  if (score >= 80) return { text: 'Likely to pass ATS filters', icon: CheckCircle, className: 'text-green-400 bg-green-500/5 border-green-500/10' }
  if (score >= 60) return { text: 'Moderate chance of passing', icon: Sparkles, className: 'text-amber-400 bg-amber-500/5 border-amber-500/10' }
  if (score >= 40) return { text: 'High risk of automated filter rejection', icon: AlertTriangle, className: 'text-orange-400 bg-orange-500/5 border-orange-500/10' }
  return { text: 'Will fail parsing checks', icon: ShieldAlert, className: 'text-red-400 bg-red-500/5 border-red-500/10' }
}

export default function AtsScoreRing({ score }) {
  const color = getScoreColor(score)
  const status = getPassLikelihood(score)
  const StatusIcon = status.icon

  // Mock breakdowns mapped proportionally to illustrate structural vs keyword compliance
  const breakdowns = [
    { label: 'Keyword Match Rate', val: Math.round(score * 0.95) },
    { label: 'Formatting & Layout Compatibility', val: Math.min(100, Math.round(score * 1.15)) },
    { label: 'Essential Sections Detected', val: score >= 40 ? 100 : 75 }
  ]

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm p-6 bg-[#0B1220]/40 border border-[#1E293B]/60 rounded-2xl backdrop-blur-sm"
    >
      {/* Visual Progress Ring */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-32">
          <CircularProgressbar
            value={score}
            text={`${score}`}
            styles={buildStyles({
              textSize: '24px',
              textColor: color,
              pathColor: color,
              trailColor: '#1E293B',
              pathTransitionDuration: 1.2,
            })}
          />
        </div>
        <div className="text-center mt-2">
          <p className="text-sm font-bold uppercase tracking-wide font-mono" style={{ color }}>
            {getScoreLabel(score)}
          </p>
          <p className="text-xs text-[#94A3B8]">Overall Compatibility Rating</p>
        </div>
      </div>

      {/* Simulator Real-Time Prediction Strip */}
      <div className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[11px] font-mono text-left ${status.className}`}>
        <StatusIcon className="w-4 h-4 shrink-0" />
        <span>{status.text}</span>
      </div>

      {/* Sub-Metric Factor Breakdowns */}
      <div className="w-full space-y-3 pt-2 border-t border-[#1E293B]/40 text-left">
        <p className="text-[10px] font-bold text-[#94A3B8]/60 uppercase tracking-wider font-mono">Factor Analysis Breakdown</p>
        {breakdowns.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#94A3B8]">{item.label}</span>
              <span className="font-mono font-medium text-white">{item.val}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.val}%` }}
                transition={{ duration: 1, delay: idx * 0.15 }}
                className="h-full rounded-full"
                style={{ backgroundColor: getScoreColor(item.val) }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}