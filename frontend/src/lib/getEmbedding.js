export async function getEmbedding(text) {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text-v2-moe',
      prompt: `search_query: ${text}`
    })
  })
  if (!response.ok) throw new Error('Ollama embedding request failed')
  const { embedding } = await response.json()
  return embedding
}
