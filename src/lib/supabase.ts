import { createClient } from '@supabase/supabase-js'

// These environment variables need to be set in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database type definitions for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          active_exercises: string[] | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          active_exercises?: string[] | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          active_exercises?: string[] | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_type: string | null
          workout_subtype: string | null
          completed: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_type?: string | null
          workout_subtype?: string | null
          completed?: boolean
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_type?: string | null
          workout_subtype?: string | null
          completed?: boolean
          date?: string
          created_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          exercise_data: Json
          sets: Json
          order_index: number
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          exercise_data?: Json
          sets?: Json
          order_index?: number
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          exercise_data?: Json
          sets?: Json
          order_index?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[] 