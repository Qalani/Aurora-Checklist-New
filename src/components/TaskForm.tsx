'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Task, Category, TaskFormData, PriorityLevel, Weekday } from '@/types'

interface TaskFormProps {
  categories: Category[]
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void
  onClose: () => void
}

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' }
]

const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
]

export default function TaskForm({ categories, onSubmit, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: categories[0]?.name || '',
    category_color: categories[0]?.color || '#3B82F6',
    due_date: '',
    repeat_interval: 'none',
    pinned: false
  })

  const [repeatChoice, setRepeatChoice] = useState<
    'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday'
  >('none')
  const [repeatDay, setRepeatDay] = useState<Weekday>('monday')

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      repeat_interval: repeatChoice === 'weekday' ? repeatDay : repeatChoice
    }))
  }, [repeatChoice, repeatDay])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

      const selectedCategory = categories.find(c => c.name === formData.category)
      const taskData = {
        ...formData,
        category: selectedCategory?.name || 'General',
        category_color: selectedCategory?.color || '#6B7280',
        due_date: formData.due_date || null,
        completed: false,
        archived: false,
        order: 0
      }

    onSubmit(taskData)
  }

  const handleCategoryChange = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      category_color: category?.color || '#6B7280'
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 w-full max-w-md border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                placeholder="Add more details..."
              />
            </div>

      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">
          Due Date
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">
          Repeat
        </label>
        <select
          value={repeatChoice}
          onChange={(e) =>
            setRepeatChoice(
              e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekday'
            )
          }
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="weekday">Specific day of the week</option>
        </select>
        {repeatChoice === 'weekday' && (
          <select
            value={repeatDay}
            onChange={(e) => setRepeatDay(e.target.value as Weekday)}
            className="mt-2 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.priority === option.value
                        ? `border-${option.color.split('-')[1]}-400 bg-${option.color.split('-')[1]}-500/20`
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-2`}></div>
                    <div className="text-sm font-medium text-white">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.pinned}
          onChange={(e) => setFormData(prev => ({ ...prev, pinned: e.target.checked }))}
          className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500"
        />
        <span className="text-sm text-white">Pin task</span>
      </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              <Plus className="inline mr-2 h-5 w-5" />
              Create Task
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
