import { useState, useEffect } from 'react'
import type { Item, Category, FamilyMember, Tag } from '../types.ts'
import { CATEGORIES, FAMILY_MEMBERS, TAGS } from '../types.ts'

interface ItemFormProps {
  item?: Item | null
  onSubmit: (data: { name: string; category: Category; assignee?: FamilyMember; number?: number; tags: Tag[] }) => Promise<void>
  onCancel: () => void
}

export default function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [assignee, setAssignee] = useState<FamilyMember | ''>('')
  const [number, setNumber] = useState(1)
  const [tags, setTags] = useState<Set<Tag>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name)
      setCategory(item.category)
      setAssignee(item.assignee || '')
      setNumber(item.number)
      setTags(new Set(item.tags as Tag[]))
    } else {
      setName('')
      setCategory('other')
      setAssignee('')
      setNumber(1)
      setTags(new Set())
    }
  }, [item])

  const handleTagToggle = (tag: Tag) => {
    setTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit({
        name: name.trim(),
        category,
        assignee: assignee || undefined,
        number,
        tags: Array.from(tags),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg border border-slate-800 w-full max-w-md">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Tent"
                autoFocus
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value as FamilyMember | '')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {FAMILY_MEMBERS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Number</label>
              <input
                type="number"
                min={1}
                value={number}
                onChange={e => setNumber(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tags.has(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-300">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
