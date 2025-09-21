import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types will be generated here
export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          name: string
          specialty: string
          bio: string
          education: string
          exhibitions: string
          profile_image: string | null
          instagram: string | null
          twitter: string | null
          website: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          specialty: string
          bio: string
          education: string
          exhibitions: string
          profile_image?: string | null
          instagram?: string | null
          twitter?: string | null
          website?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialty?: string
          bio?: string
          education?: string
          exhibitions?: string
          profile_image?: string | null
          instagram?: string | null
          twitter?: string | null
          website?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          title: string
          artist_id: string
          year: number
          medium: string
          description: string
          image: string | null
          slug: string
          status: 'available' | 'sold' | 'reserved'
          dimensions: string | null
          technique: string | null
          provenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist_id: string
          year: number
          medium: string
          description: string
          image?: string | null
          slug: string
          status?: 'available' | 'sold' | 'reserved'
          dimensions?: string | null
          technique?: string | null
          provenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist_id?: string
          year?: number
          medium?: string
          description?: string
          image?: string | null
          slug?: string
          status?: 'available' | 'sold' | 'reserved'
          dimensions?: string | null
          technique?: string | null
          provenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exhibitions: {
        Row: {
          id: string
          title: string
          status: 'current' | 'upcoming' | 'past'
          start_date: string
          end_date: string
          description: string
          location: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          status: 'current' | 'upcoming' | 'past'
          start_date: string
          end_date: string
          description: string
          location: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          status?: 'current' | 'upcoming' | 'past'
          start_date?: string
          end_date?: string
          description?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      exhibition_artworks: {
        Row: {
          id: string
          exhibition_id: string
          artwork_id: string
          created_at: string
        }
        Insert: {
          id?: string
          exhibition_id: string
          artwork_id: string
          created_at?: string
        }
        Update: {
          id?: string
          exhibition_id?: string
          artwork_id?: string
          created_at?: string
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
