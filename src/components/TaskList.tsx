'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, Circle, Trash2, Star, Calendar, GripVertical } from 'lucide-react'
import { Task, PRIORITY_COLORS, PRIORITY_LABELS } from '@/types'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (tasks: Task[]) => void
}

interface SortableTaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  index: number
}

function SortableTaskItem({ task, onToggle, onDelete, index }: SortableTaskItemProps) {
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
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Star className="w-3 h-3 mr-1" />
              {PRIORITY_LABELS[task.priority]}
            </motion.span>
            <motion.span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white"
              style={{ backgroundColor: task.category_color + '40' }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {task.category}
            </motion.span>
            <span className="text-xs text-gray-300 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

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

export default function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id)
      const newIndex = tasks.findIndex(task => task.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex)
        onReorder(newTasks)
      }
    }
  }

  if (tasks.length === 0) {
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
        <div className="text-xl text-white mb-2 relative z-10">No tasks yet</div>
        <div className="text-cyan-200 relative z-10">Create your first task to get started!</div>
      </motion.div>
    )
  }

  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white mb-6 text-center"
      >
        Your Tasks
      </motion.h2>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                index={index}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  )
}
