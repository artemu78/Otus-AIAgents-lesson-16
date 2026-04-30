import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getEmbedding } from '../lib/getEmbedding'
import { signInWithPassword, signOut, getCurrentUser } from '../api/auth'
import './AdminPage.css'

const EMPTY_FORM = { title: '', description: '', cost: '', quantity: '' }

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await signInWithPassword({ email, password })
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <div className="admin-error">{error}</div>}
        <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export function AdminPage() {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not authed
  const [goods, setGoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => { if (user) fetchGoods() }, [user])

  async function fetchGoods() {
    setLoading(true)
    const { data, error } = await supabase.from('goods').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setGoods(data ?? [])
    setLoading(false)
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm({ title: item.title ?? '', description: item.description ?? '', cost: item.cost ?? '', quantity: item.quantity ?? '' })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  async function handleSave() {
    if (!form.title.trim()) return setError('Title is required')
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        cost: form.cost !== '' ? Number(form.cost) : null,
        quantity: form.quantity !== '' ? Number(form.quantity) : null,
      }

      if (editingId && editingId !== 'new') {
        // Check if title or description changed to update embedding
        const original = goods.find(g => g.id === editingId)
        const needsEmbed = original.title !== payload.title || original.description !== payload.description
        if (needsEmbed) {
          payload.embed = await getEmbedding(`${payload.title} ${payload.description ?? ''}`)
        }
        const { error } = await supabase.from('goods').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        payload.embed = await getEmbedding(`${payload.title} ${payload.description ?? ''}`)
        const { error } = await supabase.from('goods').insert(payload)
        if (error) throw error
      }

      await fetchGoods()
      cancelEdit()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('goods').delete().eq('id', id)
    if (error) setError(error.message)
    else setGoods(prev => prev.filter(g => g.id !== id))
  }

  async function handleLogout() {
    await signOut()
    setUser(null)
  }

  const isAdding = editingId === 'new'

  if (user === undefined) return <div className="admin-loading-screen">Loading…</div>
  if (!user) return <AdminLogin onLogin={setUser} />

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin — Goods</h1>
        <div className="admin-header-right">
          <span className="admin-user">{user.email}</span>
          <button onClick={handleLogout} className="btn-secondary">Sign out</button>
          <a href="/" className="admin-back">← Back to store</a>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* Add / Edit form */}
      {(isAdding || editingId) && (
        <div className="admin-form">
          <h2>{isAdding ? 'Add item' : 'Edit item'}</h2>
          <div className="admin-form-grid">
            <label>Title *
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </label>
            <label>Description
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>
            <label>Cost
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            </label>
            <label>Quantity
              <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancelEdit} disabled={saving} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="admin-toolbar">
        {!editingId && (
          <button className="btn-primary" onClick={() => { setEditingId('new'); setForm(EMPTY_FORM); setError(null) }}>
            + Add item
          </button>
        )}
      </div>

      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {goods.map(item => (
              <tr key={item.id} className={editingId === item.id ? 'editing' : ''}>
                <td>{item.title}</td>
                <td className="admin-desc">{item.description ?? '—'}</td>
                <td>{item.cost != null ? `$${item.cost}` : '—'}</td>
                <td>{item.quantity ?? '—'}</td>
                <td className="admin-actions">
                  <button onClick={() => startEdit(item)} disabled={!!editingId} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(item.id)} disabled={!!editingId} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
            {goods.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No items yet</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
