import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          archived: boolean
          pinned: boolean
          priority: 'low' | 'medium' | 'high'
          category: string
          category_color: string
          due_date: string | null
          reminder_time: string | null
          reminder_sent: boolean
          repeat_interval: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
          order: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          archived?: boolean
          pinned?: boolean
          priority?: 'low' | 'medium' | 'high'
          category: string
          category_color: string
          due_date?: string | null
          reminder_time?: string | null
          reminder_sent?: boolean
          repeat_interval?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
          order: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          archived?: boolean
          pinned?: boolean
          priority?: 'low' | 'medium' | 'high'
          category?: string
          category_color?: string
          due_date?: string | null
          reminder_time?: string | null
          reminder_sent?: boolean
          repeat_interval?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
          order?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          created_at?: string
        }
      }
    }
  }
}
