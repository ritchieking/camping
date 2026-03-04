import { useNavigate } from 'react-router-dom'
import { useTrips } from '../lib/hooks.ts'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PastTripsPage() {
  const { trips, loading } = useTrips()
  const navigate = useNavigate()

  const pastTrips = trips.filter(t => !t.is_active)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-slate-500">Loading trips...</span>
      </div>
    )
  }

  if (pastTrips.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Past Trips</h2>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center">
          <p className="text-slate-500">No past trips yet.</p>
          <p className="text-sm text-slate-600 mt-1">
            Archive your current trip when it's complete to see it here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Past Trips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pastTrips.map(trip => (
          <button
            key={trip.id}
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="bg-slate-900 rounded-lg border border-slate-800 p-4 text-left hover:border-slate-700 transition-colors"
          >
            <h3 className="text-lg font-semibold text-slate-100">{trip.destination}</h3>
            <p className="text-slate-400 text-sm mt-1">
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </p>
            {trip.notes && (
              <p className="text-slate-500 text-sm mt-2 line-clamp-2">{trip.notes}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
