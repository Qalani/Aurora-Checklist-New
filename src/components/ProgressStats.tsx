'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Calendar, Target, Award } from 'lucide-react'
import { Task, Category } from '@/types'

interface ProgressStatsProps {
  tasks: Task[]
  categories: Category[]
  onClose: () => void
}

export default function ProgressStats({ tasks, onClose }: ProgressStatsProps) {
  const completedTasks = tasks.filter(t => t.completed)
  const pendingTasks = tasks.filter(t => !t.completed)
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  }

  const categoryStats = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

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
          className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Progress Analytics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{completionRate}%</div>
                <div className="text-cyan-200 mb-4">
                  {completedTasks.length} of {totalTasks} tasks completed
                </div>
                
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Priority Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Priority Distribution</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-200">High</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${totalTasks > 0 ? (priorityStats.high / totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{priorityStats.high}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-200">Medium</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${totalTasks > 0 ? (priorityStats.medium / totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{priorityStats.medium}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyan-200">Low</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${totalTasks > 0 ? (priorityStats.low / totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{priorityStats.low}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              </div>
              
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: task.category_color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{task.title}</div>
                      <div className="text-cyan-200 text-xs">
                        {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      task.completed ? 'bg-green-500' : 'bg-cyan-400'
                    }`} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 rounded-xl p-6 border border-white/20 md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Category Breakdown</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-cyan-200">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(count / totalTasks) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Productivity Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 rounded-xl p-6 border border-white/20 md:col-span-2"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Productivity Insights</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{pendingTasks.length}</div>
                  <div className="text-cyan-200 text-sm">Tasks Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{completedTasks.length}</div>
                  <div className="text-cyan-200 text-sm">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{priorityStats.high}</div>
                  <div className="text-cyan-200 text-sm">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{Object.keys(categoryStats).length}</div>
                  <div className="text-cyan-200 text-sm">Categories</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
