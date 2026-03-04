import { useState, useMemo } from 'react'
import { useItems } from '../lib/hooks.ts'
import type { Item, Category, Tag, FamilyMember } from '../types.ts'
import { CATEGORIES, TAGS, FAMILY_MEMBERS } from '../types.ts'
import ItemForm from '../components/ItemForm.tsx'

export default function ItemListPage() {
  const { items, loading, createItem, updateItem, deleteItem } = useItems()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')
  const [tagFilter, setTagFilter] = useState<Tag | ''>('')
  const [assigneeFilter, setAssigneeFilter] = useState<FamilyMember | ''>('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && item.category !== categoryFilter) return false
      if (tagFilter && !item.tags.includes(tagFilter)) return false
      if (assigneeFilter && item.assignee !== assigneeFilter) return false
      return true
    })
  }, [items, search, categoryFilter, tagFilter, assigneeFilter])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setTagFilter('')
    setAssigneeFilter('')
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const confirmDelete = async () => {
    if (deletingItem) {
      await deleteItem(deletingItem.id)
      setDeletingItem(null)
    }
  }

  const handleFormSubmit = async (data: { name: string; category: Category; assignee?: FamilyMember; number?: number; tags: Tag[] }) => {
    if (editingItem) {
      await updateItem(editingItem.id, { ...data, assignee: data.assignee ?? null })
    } else {
      await createItem(data)
    }
    setIsFormOpen(false)
    setEditingItem(null)
  }

  const hasFilters = search || categoryFilter || tagFilter || assigneeFilter

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-slate-500">Loading items...</span>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100">Item Bank</h2>
        <button
          onClick={() => { setEditingItem(null); setIsFormOpen(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as Category | '')}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value as Tag | '')}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All tags</option>
            {TAGS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value as FamilyMember | '')}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All assignees</option>
            {FAMILY_MEMBERS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
            <span className="text-xs text-slate-500">
              Showing {filteredItems.length} of {items.length}
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
          <p className="text-slate-500">
            {items.length === 0 ? 'No items yet. Add some to get started!' : 'No items match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-800 divide-y divide-slate-800">
          {filteredItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  {item.number > 1 ? `${item.name} (×${item.number})` : item.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                    {item.category}
                  </span>
                  {item.assignee && (
                    <span className="text-xs text-slate-500">{item.assignee}</span>
                  )}
                  {item.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleEdit(item)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingItem(item)}
                className="text-xs text-slate-400 hover:text-red-400 px-2 py-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Item form modal */}
      {isFormOpen && (
        <ItemForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingItem(null) }}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Item</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to delete &ldquo;{deletingItem.name}&rdquo;?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
