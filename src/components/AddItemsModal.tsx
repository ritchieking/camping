import { useState, useMemo } from 'react'
import type { Item, Tag } from '../types.ts'
import { TAGS } from '../types.ts'
import { useItems } from '../lib/hooks.ts'

interface AddItemsModalProps {
  existingItemIds: Set<string>
  onAddItem: (item: Item) => Promise<unknown>
  onClose: () => void
}

export default function AddItemsModal({ existingItemIds, onAddItem, onClose }: AddItemsModalProps) {
  const { items, loading } = useItems()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<Tag | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isAdding, setIsAdding] = useState(false)

  const availableItems = useMemo(() => {
    return items.filter(item => {
      if (existingItemIds.has(item.id)) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (tagFilter && !item.tags.includes(tagFilter)) return false
      return true
    })
  }, [items, existingItemIds, search, tagFilter])

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddSelected = async () => {
    setIsAdding(true)
    for (const itemId of selectedItems) {
      const item = items.find(i => i.id === itemId)
      if (item) await onAddItem(item)
    }
    setIsAdding(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Add Items to Packing List</h3>
        </div>

        {/* Tag filters */}
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-sm text-slate-400 mb-3">Filter by tag:</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  tagFilter === tag
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
            {tagFilter && (
              <button
                onClick={() => setTagFilter(null)}
                className="text-xs text-blue-400 hover:text-blue-300 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-800">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading items...</div>
          ) : availableItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {search ? 'No items match your search' : 'All items are already in your list'}
            </div>
          ) : (
            <div className="space-y-1">
              {availableItems.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm text-slate-100">
                      {item.number > 1 ? `${item.name} (×${item.number})` : item.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                        {item.category}
                      </span>
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-sm text-slate-500">
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedItems.size === 0 || isAdding}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : `Add ${selectedItems.size} Item${selectedItems.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
