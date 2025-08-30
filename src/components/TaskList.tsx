'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, Circle, Trash2, Star, Calendar, GripVertical, Edit2, Check, X, Archive, Pin, Repeat, Bell, BellOff } from 'lucide-react'
import { Task, Category, PRIORITY_COLORS, PRIORITY_LABELS, REPEAT_LABELS } from '@/types'

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onEdit: (id: string, data: Partial<Task>) => void
  onReorder: (tasks: Task[]) => void
}

interface SortableTaskItemProps {
  task: Task
  categories: Category[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onEdit: (id: string, data: Partial<Task>) => void
  index: number
}

function SortableTaskItem({ task, categories, onToggle, onDelete, onArchive, onEdit, index }: SortableTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    category_color: task.category_color,
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    reminder_time: task.reminder_time ? task.reminder_time.slice(0, 16) : '',
    repeat_interval: task.repeat_interval
  })

  useEffect(() => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      category_color: task.category_color,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      reminder_time: task.reminder_time ? task.reminder_time.slice(0, 16) : '',
      repeat_interval: task.repeat_interval
    })
  }, [task])

  const handleCategoryChange = (name: string) => {
    const cat = categories.find(c => c.name === name)
    setEditData(prev => ({
      ...prev,
      category: name,
      category_color: cat?.color || prev.category_color
    }))
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(task.id, {
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      category: editData.category,
      category_color: editData.category_color,
      due_date: editData.due_date || null,
      reminder_time: editData.reminder_time ? new Date(editData.reminder_time).toISOString() : null,
      reminder_sent: false,
      repeat_interval: editData.repeat_interval
    })
    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      category_color: task.category_color,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      reminder_time: task.reminder_time ? task.reminder_time.slice(0, 16) : '',
      repeat_interval: task.repeat_interval
    })
  }
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20, x: -50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 50 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.1,
        type: "spring",
        stiffness: 300
      }}
      className={`bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/30 relative overflow-hidden ${
        isDragging ? 'opacity-50 scale-105 rotate-2 shadow-2xl z-50' : ''
      }`}
    >
      {/* Subtle animated background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundSize: '200% 200%'
        }}
      />
      
      <div className="relative z-10 flex items-center gap-4">
        {/* Enhanced Drag Handle */}
        <motion.div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95, rotate: -5 }}
        >
          <GripVertical className="w-5 h-5 text-cyan-300 hover:text-cyan-200" />
        </motion.div>

        {/* Enhanced Toggle Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task.id)
          }}
          className="flex-shrink-0 text-2xl hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {task.completed ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative"
            >
              <CheckCircle2 className="text-green-400" />
              {/* Completion sparkle effect */}
              <motion.div
                className="absolute inset-0 text-yellow-300"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                ✨
              </motion.div>
            </motion.div>
          ) : (
            <Circle className="text-cyan-300 hover:text-cyan-200" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                className="w-full mb-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                className="w-full mb-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none resize-none"
                rows={2}
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              />
              <input
                type="date"
                className="w-full mb-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none"
                value={editData.due_date}
                onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
              />
              <input
                type="datetime-local"
                className="w-full mb-2 px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none"
                value={editData.reminder_time}
                onChange={(e) => setEditData(prev => ({ ...prev, reminder_time: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  value={editData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={editData.repeat_interval}
                  onChange={(e) => setEditData(prev => ({ ...prev, repeat_interval: e.target.value as Task['repeat_interval'] }))}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="none">No repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <motion.div
                className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-300' : 'text-white'}`}
                animate={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? '#D1D5DB' : '#FFFFFF'
                }}
                transition={{ duration: 0.3 }}
              >
                {task.title}
              </motion.div>
              {task.description && (
                <motion.div
                  className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-cyan-100'}`}
                  animate={{
                    color: task.completed ? '#9CA3AF' : '#67E8F9'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {task.description}
                </motion.div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <motion.span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    PRIORITY_COLORS[task.priority]
                  } text-white`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {PRIORITY_LABELS[task.priority]}
                </motion.span>
                <motion.span
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
                  style={{ backgroundColor: task.category_color + '40' }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {task.category}
                </motion.span>
                {task.repeat_interval !== 'none' && (
                  <motion.span
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Repeat className="w-3 h-3 mr-1" />
                    {REPEAT_LABELS[task.repeat_interval]}
                  </motion.span>
                )}
                <span className="text-xs text-gray-300 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date((task.due_date || task.created_at)).toLocaleDateString()}
                </span>
                {task.reminder_time && (
                  <span
                    className={`text-xs flex items-center ${
                      task.reminder_sent ? 'text-green-300' : 'text-cyan-300'
                    }`}
                  >
                    {task.reminder_sent ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Bell className="w-3 h-3 mr-1" />
                    )}
                    {task.reminder_sent
                      ? 'Reminder sent'
                      : new Date(task.reminder_time).toLocaleString()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {isEditing ? (
          <>
            <motion.button
              onClick={handleSave}
              className="flex-shrink-0 text-green-400 hover:text-green-300 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
            >
              <Check className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex-shrink-0 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="flex-shrink-0 text-cyan-400 hover:text-cyan-300 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
        )}
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            if (task.reminder_time) {
              onEdit(task.id, { reminder_time: null, reminder_sent: false })
            } else {
              setIsEditing(true)
            }
          }}
          className={`flex-shrink-0 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg ${
            task.reminder_time ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
        >
          {task.reminder_time ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </motion.button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task.id, { pinned: !task.pinned })
          }}
          className={`flex-shrink-0 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg ${
            task.pinned ? 'text-purple-400 hover:text-purple-300' : 'text-gray-400 hover:text-gray-300'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
        >
          <Pin className="w-5 h-5" />
        </motion.button>

        {!task.archived && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onArchive(task.id)
            }}
            className="flex-shrink-0 text-yellow-400 hover:text-yellow-300 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
          >
            <Archive className="w-5 h-5" />
          </motion.button>
        )}

        {/* Enhanced Delete Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          className="flex-shrink-0 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9, rotate: -5 }}
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function TaskList({ tasks, categories, onToggle, onDelete, onArchive, onEdit, onReorder }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | ''>('')
  const [view, setView] = useState<'active' | 'archived'>('active')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only start dragging after 8px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const viewTasks = tasks.filter(task => (view === 'archived' ? task.archived : !task.archived))
  const pinnedTasks = viewTasks.filter(task => task.pinned)
  const unpinnedTasks = viewTasks.filter(task => !task.pinned)

  const filterFn = (task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true
    return matchesSearch && matchesPriority
  }

  const filteredPinnedTasks = pinnedTasks.filter(filterFn)
  const filteredUnpinnedTasks = unpinnedTasks.filter(filterFn)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const viewTasks = tasks.filter(t => (view === 'archived' ? t.archived : !t.archived))
    const activeTask = viewTasks.find(t => t.id === active.id)
    const overTask = viewTasks.find(t => t.id === over.id)
    if (!activeTask || !overTask) return
    if (activeTask.pinned !== overTask.pinned) return

    const pinned = viewTasks.filter(t => t.pinned)
    const unpinned = viewTasks.filter(t => !t.pinned)
    const group = activeTask.pinned ? pinned : unpinned
    const otherGroup = activeTask.pinned ? unpinned : pinned
    const oldIndex = group.findIndex(t => t.id === active.id)
    const newIndex = group.findIndex(t => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newGroup = arrayMove(group, oldIndex, newIndex)
    const newViewTasks = activeTask.pinned
      ? [...newGroup, ...otherGroup]
      : [...otherGroup, ...newGroup]
    const otherTasks = tasks.filter(t => (view === 'archived' ? !t.archived : t.archived))
    const newTasks = view === 'archived' ? [...otherTasks, ...newViewTasks] : [...newViewTasks, ...otherTasks]
    onReorder(newTasks)
  }

  if (viewTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 relative"
      >
        {/* Floating particles for empty state */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div 
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-cyan-400/30 rounded-full"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-400/30 rounded-full"
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-pink-400/30 rounded-full"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>
        
        <motion.div 
          className="text-6xl mb-4 relative z-10"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>
        <div className="text-xl text-white mb-2 relative z-10">{view === 'archived' ? 'No archived tasks' : 'No tasks yet'}</div>
        {view !== 'archived' && (
          <div className="text-cyan-200 relative z-10">Create your first task to get started!</div>
        )}
      </motion.div>
    )
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-6 gap-6"
      >
        <button
          onClick={() => setView('active')}
          className={`pb-1 transition-colors ${view === 'active' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
        >
          Your Tasks
        </button>
        <button
          onClick={() => setView('archived')}
          className={`pb-1 transition-colors ${view === 'archived' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
        >
          Archived
        </button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Search tasks..."
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Task['priority'] | '')}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
        >
          <option value="">All priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredPinnedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {filteredPinnedTasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                categories={categories}
                onToggle={onToggle}
                onDelete={onDelete}
                onArchive={onArchive}
                onEdit={onEdit}
                index={index}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        <SortableContext items={filteredUnpinnedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {filteredUnpinnedTasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                categories={categories}
                onToggle={onToggle}
                onDelete={onDelete}
                onArchive={onArchive}
                onEdit={onEdit}
                index={index + filteredPinnedTasks.length}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  )
}
