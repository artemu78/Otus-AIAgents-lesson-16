import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const CategoryRealtimePage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCategories = async () => {
    const { data, error: fetchError } = await supabase
      .from('category')
      .select('id, name')
      .order('id', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    setError('')
    setCategories(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      await loadCategories()
      if (isMounted) {
        setLoading(false)
      }
    }

    init()

    const channel = supabase
      .channel('category-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'category' },
        async () => {
          await loadCategories()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="simple-category-page">
      <h1>Category Realtime</h1>
      <p>Route: /category-realtime</p>
      {loading && <p>Loading categories...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>{category.name || 'Unnamed category'}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
