export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content_md: string
  excerpt: string | null
  tags: string[] | null
  created_at: string | null
  updated_at: string | null
}
