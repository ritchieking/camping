import { useState } from 'react'
import { useActiveTrip, usePackingList } from '../lib/hooks.ts'
import PackingList from '../components/PackingList.tsx'
import AddItemsModal from '../components/AddItemsModal.tsx'
import TripForm from '../components/TripForm.tsx'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CurrentTripPage() {
  const { trip, loading: tripLoading, createTrip, archiveTrip } = useActiveTrip()
  const { items, loading: listLoading, packItem, unpackItem, addItem, removeItem } = usePackingList(trip?.id ?? null)
  const [showAddItems, setShowAddItems] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  const handleArchive = async () => {
    if (!trip) return
    setIsArchiving(true)
    await archiveTrip(trip.id)
    setIsArchiving(false)
  }

  const existingItemIds = new Set(items.map(i => i.item_id))

  if (tripLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-slate-500">Loading...</span>
      </div>
    )
  }

  // No active trip
  if (!trip) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <span className="text-6xl mb-4 block">&#x1F3D5;&#xFE0F;</span>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Plan Your Next Adventure</h2>
          <p className="text-slate-400">Create a new trip to start building your packing list.</p>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
          <TripForm onSubmit={createTrip} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Trip header */}
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{trip.destination}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </p>
            {trip.notes && <p className="text-slate-500 text-sm mt-2">{trip.notes}</p>}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowAddItems(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            Add Items
          </button>
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {isArchiving ? 'Archiving...' : 'Archive Trip'}
          </button>
        </div>
      </div>

      {listLoading ? (
        <div className="flex justify-center py-12">
          <span className="text-slate-500">Loading packing list...</span>
        </div>
      ) : (
        <PackingList
          items={items}
          onToggle={(id, shouldPack) => shouldPack ? packItem(id) : unpackItem(id)}
          onRemove={removeItem}
        />
      )}

      {showAddItems && (
        <AddItemsModal
          existingItemIds={existingItemIds}
          onAddItem={addItem}
          onClose={() => setShowAddItems(false)}
        />
      )}
    </div>
  )
}
