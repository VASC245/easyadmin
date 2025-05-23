import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project values
const supabaseUrl = 'https://gccbsoozbekmsewbzpyh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjY2Jzb296YmVrbXNld2J6cHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODYwNzUsImV4cCI6MjA2MzQ2MjA3NX0.pMgBoRUa83SNS8qjj0Ihism3Bw2ceSsdCt49YxwvjfU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
