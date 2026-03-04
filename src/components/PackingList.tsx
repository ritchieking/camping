import { useState, useMemo } from 'react'
import type { PackingListItem, Category } from '../types.ts'
import { CATEGORIES } from '../types.ts'

interface PackingListProps {
  items: PackingListItem[]
  onToggle: (id: string, shouldPack: boolean) => void
  onRemove: (id: string) => void
}

export default function PackingList({ items, onToggle, onRemove }: PackingListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')
  const [hidePacked, setHidePacked] = useState(false)

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && item.category !== categoryFilter) return false
      if (hidePacked && item.is_packed) return false
      return true
    })
  }, [items, search, categoryFilter, hidePacked])

  const groupedItems = useMemo(() => {
    const groups = {} as Record<Category, PackingListItem[]>
    for (const category of CATEGORIES) groups[category] = []
    for (const item of filteredItems) groups[item.category].push(item)
    return groups
  }, [filteredItems])

  const packedCount = items.filter(i => i.is_packed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
        <p className="text-slate-500 mb-2">No items in your packing list yet.</p>
        <p className="text-sm text-slate-600">Add items from the Item Bank to get started.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-400">Packing Progress</span>
          <span className="text-sm text-slate-500">
            {packedCount} / {totalCount} items ({progress}%)
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search packing list..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as Category | '')}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => setHidePacked(!hidePacked)}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              hidePacked
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {hidePacked ? 'Showing unpacked' : 'Show all'}
          </button>
        </div>
      </div>

      {/* Grouped items */}
      <div className="space-y-6">
        {CATEGORIES.map(category => {
          const categoryItems = groupedItems[category]
          if (categoryItems.length === 0) return null
          const categoryPacked = categoryItems.filter(i => i.is_packed).length

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-slate-100 capitalize">{category}</h3>
                <span className="text-sm text-slate-500">({categoryPacked}/{categoryItems.length})</span>
              </div>
              <div className="space-y-1">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.is_packed ? 'bg-emerald-900/20' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <button
                      onClick={() => onToggle(item.id, !item.is_packed)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        item.is_packed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                      aria-label={`Mark ${item.name} as ${item.is_packed ? 'unpacked' : 'packed'}`}
                    >
                      {item.is_packed && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${item.is_packed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {item.number > 1 ? `${item.name} (×${item.number})` : item.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize hidden sm:inline">
                          {item.category}
                        </span>
                      </div>
                      {item.assignee && (
                        <span className="text-xs text-slate-500 mt-0.5 block">{item.assignee}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-400 hidden md:inline">
                          {tag}
                        </span>
                      ))}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="text-slate-600 hover:text-red-400 ml-2 p-1 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
          <p className="text-slate-500">No items match your filters.</p>
        </div>
      )}
    </div>
  )
}
