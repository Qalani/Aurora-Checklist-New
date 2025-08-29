export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  category_color: string
  order: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  category_color: string
}

export interface CategoryFormData {
  name: string
  color: string
}

export type PriorityLevel = 'low' | 'medium' | 'high'

export const PRIORITY_COLORS = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500'
} as const

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
} as const
