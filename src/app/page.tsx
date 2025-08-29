'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Plus, Settings, BarChart3, LogOut } from 'lucide-react'
import TaskList from '@/components/TaskList'
import TaskForm from '@/components/TaskForm'
import CategoryManager from '@/components/CategoryManager'
import ProgressStats from '@/components/ProgressStats'
import { Task, Category, CategoryFormData } from '@/types'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/AuthForm'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [user, setUser] = useState<User | null>(null)

  const { scrollY } = useScroll()
  const springConfig = { damping: 20, stiffness: 100 }

  // Parallax transforms
  const backgroundY = useSpring(useTransform(scrollY, [0, 1000], [0, 200]), springConfig)
  const aurora1Y = useSpring(useTransform(scrollY, [0, 1000], [0, -300]), springConfig)
  const aurora2Y = useSpring(useTransform(scrollY, [0, 1000], [0, 400]), springConfig)
  const aurora3Y = useSpring(useTransform(scrollY, [0, 1000], [0, -200]), springConfig)

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchData(session.user.id)
      } else {
        setLoading(false)
      }
    }
    init()

    // Auth state listener
    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchData(session.user.id)
      } else {
        setTasks([])
        setCategories([])
      }
    })

    // Mouse movement effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchData = async (userId: string) => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true })

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (tasksError) throw tasksError
      if (categoriesError) throw categoriesError

      setTasks((tasksData ?? []) as Task[])
      setCategories((categoriesData ?? []) as Category[])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (
    taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    if (!user) return
    const activeCount = tasks.filter(t => !t.archived).length
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: user.id,
        completed: false,
        archived: false,
        order: activeCount + 1,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      return
    }

    const archived = tasks.filter(t => t.archived)
    const active = [...tasks.filter(t => !t.archived), data as Task]
    const pinned = active.filter(t => t.pinned)
    const unpinned = active.filter(t => !t.pinned)
    const newList = [...pinned, ...unpinned, ...archived]
    setTasks(newList)
    updateTaskOrder(newList)
    setShowTaskForm(false)
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    if (!task.completed && task.repeat_interval !== 'none') {
      const base = task.due_date ? new Date(task.due_date) : new Date()
      switch (task.repeat_interval) {
        case 'daily':
          base.setDate(base.getDate() + 1)
          break
        case 'weekly':
          base.setDate(base.getDate() + 7)
          break
        case 'monthly':
          base.setMonth(base.getMonth() + 1)
          break
        case 'yearly':
          base.setFullYear(base.getFullYear() + 1)
          break
      }
      const { data, error } = await supabase
        .from('tasks')
        .update({
          due_date: base.toISOString(),
          completed: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling task:', error)
        return
      }

      setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)))
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling task:', error)
      return
    }

    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)))
  }

  const editTask = async (id: string, updated: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updated, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return
    }

    setTasks((prev) => {
      const replaced = prev.map((t) => (t.id === id ? (data as Task) : t))
      if ('pinned' in updated) {
        const active = replaced.filter(t => !t.archived)
        const archived = replaced.filter(t => t.archived)
        const pinned = active.filter(t => t.pinned)
        const unpinned = active.filter(t => !t.pinned)
        const reordered = [...pinned, ...unpinned, ...archived]
        updateTaskOrder(reordered)
        return reordered
      }
      return replaced
    })
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error deleting task:', error)
      return
    }

    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const archiveTask = async (id: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) {
      console.error('Error archiving task:', error)
      return
    }

    setTasks((prev) => prev.map((task) => (task.id === id ? (data as Task) : task)))
  }

  const updateTaskOrder = async (newTasks: Task[]) => {
    setTasks(newTasks)
    await Promise.all(
      newTasks.map((task, index) =>
        supabase
          .from('tasks')
          .update({ order: index + 1 })
          .eq('id', task.id)
          .eq('user_id', user?.id)
      )
    )
  }

  const addCategory = async (data: CategoryFormData) => {
    if (!user) return
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return
    }

    setCategories((prev) => [...prev, newCategory as Category])
  }

  const updateCategory = async (id: string, data: CategoryFormData) => {
    if (!user) return
    const { data: updated, error } = await supabase
      .from('categories')
      .update({ ...data })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? (updated as Category) : c))
    )
  }

  const deleteCategory = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting category:', error)
      return
    }

    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTasks([])
    setCategories([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-20"
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ✨
          </motion.div>
          <div className="text-white text-2xl">Loading Aurora...</div>
        </motion.div>
        
        {/* Loading background animation */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const activeTasks = tasks.filter(t => !t.archived)
  const completedCount = activeTasks.filter(t => t.completed).length
  const totalCount = activeTasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      {/* Enhanced Aurora Background Effects with Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient background with subtle movement */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
          style={{ y: backgroundY }}
        />
        
        {/* Floating aurora orbs with parallax */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ y: aurora1Y }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ y: aurora2Y }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.4, 0.3],
            x: [0, -30, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        <motion.div 
          className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ y: aurora3Y }}
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.45, 0.3],
            x: [0, 25, 0],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: "easeInOut",
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Additional floating particles */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -100, 0],
            x: [0, 50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 80, 0],
            x: [0, -40, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mouse-following aurora effect */}
        <motion.div 
          className="absolute w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl pointer-events-none"
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
        />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Aurora
          </motion.h1>
          <motion.p 
            className="text-xl text-cyan-100"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Organize your life with cosmic beauty
          </motion.p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 relative overflow-hidden"
        >
          {/* Animated background for stats */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundSize: '200% 200%'
            }}
          />
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl font-bold text-white">{totalCount}</div>
              <div className="text-cyan-200">Total Tasks</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl font-bold text-white">{completedCount}</div>
              <div className="text-cyan-200">Completed</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl font-bold text-white">{totalCount - completedCount}</div>
              <div className="text-cyan-200">Pending</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="text-3xl font-bold text-white">{progressPercentage}%</div>
              <div className="text-cyan-200">Progress</div>
            </motion.div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <motion.div 
            className="w-full bg-white/20 rounded-full h-3 mt-4 relative overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <motion.div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            >
              {/* Shimmer effect on progress bar */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <motion.button
            onClick={() => setShowTaskForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <span className="relative z-10">
              <Plus className="inline mr-2 h-5 w-5" />
              Add Task
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowCategoryManager(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/25 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            />
            <span className="relative z-10">
              <Settings className="inline mr-2 h-5 w-5" />
              Categories
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowStats(true)}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/25 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
            />
            <span className="relative z-10">
              <BarChart3 className="inline mr-2 h-5 w-5" />
              Analytics
            </span>
          </motion.button>

          <motion.button
            onClick={handleSignOut}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25 relative overflow-hidden"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 1.5 }}
            />
            <span className="relative z-10">
              <LogOut className="inline mr-2 h-5 w-5" />
              Sign Out
            </span>
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 relative overflow-hidden"
        >
          {/* Subtle animated background for main content */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 to-purple-500/3"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundSize: '200% 200%'
            }}
          />
          
          <div className="relative z-10">
            <TaskList
              tasks={tasks}
              categories={categories}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onArchive={archiveTask}
              onEdit={editTask}
              onReorder={updateTaskOrder}
            />
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showTaskForm && (
            <TaskForm
              categories={categories}
              onSubmit={addTask}
              onClose={() => setShowTaskForm(false)}
            />
          )}

          {showCategoryManager && (
            <CategoryManager
              categories={categories}
              onCreate={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onClose={() => setShowCategoryManager(false)}
            />
          )}

          {showStats && (
            <ProgressStats
              tasks={tasks}
              categories={categories}
              onClose={() => setShowStats(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
