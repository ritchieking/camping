import { useState } from 'react'

interface TripFormProps {
  onSubmit: (data: {
    destination: string
    start_date: string
    end_date: string
    notes?: string
  }) => Promise<unknown>
}

export default function TripForm({ onSubmit }: TripFormProps) {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim() || !startDate || !endDate) {
      setError('Destination and dates are required')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await onSubmit({
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="e.g., Yosemite National Park"
            autoFocus
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Start Planning'}
        </button>
      </div>
    </form>
  )
}
