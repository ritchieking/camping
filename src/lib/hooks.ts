import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.ts'
import type { Item, Trip, PackingListItem, Category, FamilyMember, Tag } from '../types.ts'

// ── Items ──────────────────────────────────────────────────────────────

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('category')
      .order('name')
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createItem = async (input: {
    name: string
    category: Category
    assignee?: FamilyMember
    number?: number
    tags: Tag[]
  }) => {
    const { data } = await supabase
      .from('items')
      .insert({ ...input, assignee: input.assignee ?? null, number: input.number ?? 1 })
      .select()
      .single()
    if (data) setItems(prev => [...prev, data])
    return data
  }

  const updateItem = async (
    id: string,
    input: Partial<{ name: string; category: Category; assignee: FamilyMember | null; number: number; tags: Tag[] }>,
  ) => {
    const { data } = await supabase
      .from('items')
      .update(input)
      .eq('id', id)
      .select()
      .single()
    if (data) setItems(prev => prev.map(i => (i.id === id ? data : i)))
    return data
  }

  const deleteItem = async (id: string) => {
    await supabase.from('items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, loading, refetch: fetch, createItem, updateItem, deleteItem }
}

// ── Active Trip ────────────────────────────────────────────────────────

export function useActiveTrip() {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    setTrip(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createTrip = async (input: {
    destination: string
    start_date: string
    end_date: string
    notes?: string
  }) => {
    const { data } = await supabase
      .from('trips')
      .insert(input)
      .select()
      .single()
    if (data) setTrip(data)
    return data
  }

  const archiveTrip = async (id: string) => {
    await supabase.from('trips').update({ is_active: false }).eq('id', id)
    setTrip(null)
  }

  return { trip, loading, refetch: fetch, createTrip, archiveTrip }
}

// ── Trips ──────────────────────────────────────────────────────────────

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const { data } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: false })
      setTrips(data ?? [])
      setLoading(false)
    })()
  }, [])

  return { trips, loading }
}

// ── Trip Detail ────────────────────────────────────────────────────────

export function useTripDetail(id: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [items, setItems] = useState<PackingListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const [tripRes, itemsRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id).single(),
        supabase.from('packing_list_items').select('*').eq('trip_id', id).order('category').order('name'),
      ])
      setTrip(tripRes.data)
      setItems(itemsRes.data ?? [])
      setLoading(false)
    })()
  }, [id])

  return { trip, items, loading }
}

// ── Packing List ───────────────────────────────────────────────────────

export function usePackingList(tripId: string | null) {
  const [items, setItems] = useState<PackingListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!tripId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('packing_list_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('category')
      .order('name')
    setItems(data ?? [])
    setLoading(false)
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!tripId) return

    const channel = supabase
      .channel(`packing-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packing_list_items',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as PackingListItem
            setItems(prev => {
              if (prev.some(i => i.id === row.id)) return prev
              return [...prev, row]
            })
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as PackingListItem
            setItems(prev => prev.map(i => (i.id === row.id ? row : i)))
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id: string }
            setItems(prev => prev.filter(i => i.id !== old.id))
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId])

  const packItem = async (id: string, packedBy: FamilyMember = 'Ritchie') => {
    // Optimistic
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, is_packed: true, packed_by: packedBy, packed_at: new Date().toISOString() } : i,
      ),
    )
    await supabase
      .from('packing_list_items')
      .update({ is_packed: true, packed_by: packedBy, packed_at: new Date().toISOString() })
      .eq('id', id)
  }

  const unpackItem = async (id: string) => {
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, is_packed: false, packed_by: null, packed_at: null } : i,
      ),
    )
    await supabase
      .from('packing_list_items')
      .update({ is_packed: false, packed_by: null, packed_at: null })
      .eq('id', id)
  }

  const addItem = async (item: Item) => {
    const { data } = await supabase
      .from('packing_list_items')
      .insert({
        trip_id: tripId,
        item_id: item.id,
        name: item.name,
        category: item.category,
        assignee: item.assignee,
        number: item.number,
        tags: item.tags,
      })
      .select()
      .single()
    if (data) {
      setItems(prev => {
        if (prev.some(i => i.id === data.id)) return prev
        return [...prev, data]
      })
    }
    return data
  }

  const removeItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('packing_list_items').delete().eq('id', id)
  }

  return { items, loading, refetch: fetch, packItem, unpackItem, addItem, removeItem }
}
