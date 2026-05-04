import { marked } from 'marked'

export async function parseMarkdownToHtml(value: string) {
  if (value.trim() === '') {
    return ''
  }

  return (await marked.parse(value)) as string
}
