// src/lib/utils.js
// Utility to merge Tailwind classes safely (shadcn/ui uses this)
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}