import { getSupabaseClient } from './supabase'
import type { UserFileRecord } from '../types/userFile'

const profileFilesBucket = 'perfil-files'
const signedUrlExpiresInSeconds = 60 * 60

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function buildFilePath(userId: string, fileName: string) {
  const safeName = sanitizeFileName(fileName) || 'arquivo'
  return `${userId}/${Date.now()}-${safeName}`
}

export async function listProfileFiles(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('user_files')
    .select('id, user_id, bucket, file_path, name, description, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as UserFileRecord[]
}

export async function createProfileFileSignedUrl(filePath: string) {
  const { data, error } = await getSupabaseClient().storage
    .from(profileFilesBucket)
    .createSignedUrl(filePath, signedUrlExpiresInSeconds)

  if (error) {
    throw error
  }

  return data.signedUrl
}

type UploadProfileFileInput = {
  userId: string
  file: File
  name: string
  description: string
}

export async function uploadProfileFile({
  userId,
  file,
  name,
  description,
}: UploadProfileFileInput) {
  const filePath = buildFilePath(userId, file.name)
  const supabase = getSupabaseClient()

  const { error: uploadError } = await supabase.storage
    .from(profileFilesBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) {
    throw uploadError
  }

  const { error: insertError } = await supabase.from('user_files').insert({
    user_id: userId,
    bucket: profileFilesBucket,
    file_path: filePath,
    name,
    description: description.trim() || null,
  })

  if (insertError) {
    await supabase.storage.from(profileFilesBucket).remove([filePath])
    throw insertError
  }
}

export async function deleteProfileFile(fileId: string, filePath: string) {
  const supabase = getSupabaseClient()

  const { error: deleteMetadataError } = await supabase
    .from('user_files')
    .delete()
    .eq('id', fileId)

  if (deleteMetadataError) {
    throw deleteMetadataError
  }

  const { error: deleteStorageError } = await supabase.storage
    .from(profileFilesBucket)
    .remove([filePath])

  if (deleteStorageError) {
    throw deleteStorageError
  }
}
