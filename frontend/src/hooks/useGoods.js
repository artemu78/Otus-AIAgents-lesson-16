import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// Pure state-mutation helpers (exported for testing)

export function applyInsert(list, newGood) {
  return [newGood, ...list]
}

export function applyUpdate(list, updatedGood) {
  return list.map((item) => (item.id === updatedGood.id ? updatedGood : item))
}

export function applyDelete(list, id) {
  return list.filter((item) => item.id !== id)
}

// useGoods hook

export function useGoods() {
  const [goods, setGoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')

  const searchGoods = async (query, embedding = null) => {
    try {
      setLoading(true)
      if (Array.isArray(embedding) && embedding.length > 0) {
        const { data, error: rpcError } = await supabase.rpc('match_goods', {
          query_embedding: embedding,
          match_threshold: 0.2,
          match_count: 10
        })
        if (rpcError) throw rpcError
        return data
      } else {
        const { data, error: fetchError } = await supabase
          .from('goods')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('created_at', { ascending: false })
        if (fetchError) throw fetchError
        return data
      }
    } catch (err) {
      setError(err.message ?? 'Search failed')
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let channel

    async function fetchGoods() {
      try {
        const { data, error: fetchError } = await supabase
          .from('goods')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setGoods(data ?? [])
      } catch (err) {
        setError(err.message ?? 'Failed to fetch goods')
      } finally {
        setLoading(false)
      }
    }

    fetchGoods()

    channel = supabase
      .channel('goods-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'goods' },
        (payload) => {
          if (!payload.new?.id) return
          setGoods((prev) => applyInsert(prev, payload.new))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'goods' },
        (payload) => {
          if (!payload.new?.id) return
          setGoods((prev) => applyUpdate(prev, payload.new))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'goods' },
        (payload) => {
          if (!payload.old?.id) return
          setGoods((prev) => applyDelete(prev, payload.old.id))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('reconnecting')
        } else if (status === 'CLOSED') {
          setRealtimeStatus('disconnected')
        }
      })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { goods, loading, error, realtimeStatus, searchGoods }
}
