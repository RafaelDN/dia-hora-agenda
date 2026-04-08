const markdownModules = import.meta.glob('../../markdown/*.md', {
  query: '?raw',
  import: 'default',
})

const markdownCache = new Map<string, string>()

export async function loadMarkdownDocument(fileName: string): Promise<string> {
  const normalizedFileName = normalizeFileName(fileName)
  const cachedMarkdown = markdownCache.get(normalizedFileName)

  if (cachedMarkdown) {
    return cachedMarkdown
  }

  const modulePath = `../../markdown/${normalizedFileName}`
  const loader = markdownModules[modulePath]

  if (!loader) {
    throw new Error(`Arquivo markdown nao encontrado: ${normalizedFileName}`)
  }

  const markdownContent = normalizeMarkdownContent((await loader()) as string)
  markdownCache.set(normalizedFileName, markdownContent)

  return markdownContent
}

function normalizeFileName(fileName: string) {
  return fileName.replace(/^\.?[\\/]/, '').replace(/^markdown[\\/]/, '')
}

function normalizeMarkdownContent(content: string) {
  return content.replace(/^\uFEFF/, '')
}
