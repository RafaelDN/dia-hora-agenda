export interface UserFileRecord {
  id: string
  user_id: string
  bucket: string
  file_path: string
  name: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}
