import { useEffect, useState } from 'react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const CategoryPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/category?select=id,name&order=id.asc`,
          {
            headers: {
              apikey: ANON_KEY,
              Authorization: `Bearer ${ANON_KEY}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load categories')
        }

        const data = await response.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section className="simple-category-page">
      <h2>Categories</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>{category.name || 'Unnamed category'}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
