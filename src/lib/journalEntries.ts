import { getSupabaseClient } from './supabase'
import type { JournalEntry } from '../types/journalEntry'

type JournalEntryInput = {
  title: string
  contentMd: string
  tags: string[]
}

function normalizeTags(tags: string[]) {
  const seen = new Set<string>()

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '')
    .filter((tag) => {
      if (seen.has(tag)) {
        return false
      }

      seen.add(tag)
      return true
    })
}

function buildExcerpt(contentMd: string) {
  const plainText = contentMd
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plainText.length <= 180) {
    return plainText || null
  }

  return `${plainText.slice(0, 177).trimEnd()}...`
}

export async function listJournalEntries(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('journal_entries')
    .select('id, user_id, title, content_md, excerpt, tags, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as JournalEntry[]
}

export async function createJournalEntry(userId: string, input: JournalEntryInput) {
  const { error } = await getSupabaseClient().from('journal_entries').insert({
    user_id: userId,
    title: input.title,
    content_md: input.contentMd,
    excerpt: buildExcerpt(input.contentMd),
    tags: normalizeTags(input.tags),
  })

  if (error) {
    throw error
  }
}

export async function updateJournalEntry(entryId: string, input: JournalEntryInput) {
  const { error } = await getSupabaseClient()
    .from('journal_entries')
    .update({
      title: input.title,
      content_md: input.contentMd,
      excerpt: buildExcerpt(input.contentMd),
      tags: normalizeTags(input.tags),
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)

  if (error) {
    throw error
  }
}

export async function deleteJournalEntry(entryId: string) {
  const { error } = await getSupabaseClient()
    .from('journal_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    throw error
  }
}
