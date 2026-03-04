import { useParams, useNavigate } from 'react-router-dom'
import { useTripDetail } from '../lib/hooks.ts'
import { CATEGORIES } from '../types.ts'
import type { Category, PackingListItem } from '../types.ts'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trip, items, loading } = useTripDetail(id)

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-950 flex justify-center py-12">
        <span className="text-slate-500">Loading trip...</span>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-dvh bg-slate-950 p-4">
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg mb-4">
          Trip not found
        </div>
        <button
          onClick={() => navigate('/past-trips')}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Past Trips
        </button>
      </div>
    )
  }

  const groupedItems = CATEGORIES.reduce((acc, category) => {
    acc[category] = items.filter(i => i.category === category)
    return acc
  }, {} as Record<Category, PackingListItem[]>)

  const packedCount = items.filter(i => i.is_packed).length

  return (
    <div className="min-h-dvh bg-slate-950 p-4 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/past-trips')}
        className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block"
      >
        &larr; Back to Past Trips
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">{trip.destination}</h2>
        <p className="text-slate-400 text-sm mt-1">
          {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
        </p>
        {trip.notes && <p className="text-slate-500 text-sm mt-2">{trip.notes}</p>}
        <p className="text-sm text-slate-500 mt-3">
          {packedCount} of {items.length} items were packed
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
          <p className="text-slate-500">No items were added to this trip.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map(category => {
            const categoryItems = groupedItems[category]
            if (categoryItems.length === 0) return null

            return (
              <div key={category} className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                <h3 className="text-lg font-semibold text-slate-100 capitalize mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-2 rounded ${
                        item.is_packed ? 'bg-emerald-900/20' : 'bg-slate-800/50'
                      }`}
                    >
                      <span className={item.is_packed ? 'text-emerald-400' : 'text-slate-600'}>
                        {item.is_packed ? '\u2713' : '\u25CB'}
                      </span>
                      <span className={item.is_packed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {item.number > 1 ? `${item.name} (×${item.number})` : item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
