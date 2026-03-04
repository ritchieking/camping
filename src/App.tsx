import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import CurrentTripPage from './pages/CurrentTripPage.tsx'
import ItemListPage from './pages/ItemListPage.tsx'
import PastTripsPage from './pages/PastTripsPage.tsx'
import TripDetailPage from './pages/TripDetailPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CurrentTripPage />} />
        <Route path="/items" element={<ItemListPage />} />
        <Route path="/past-trips" element={<PastTripsPage />} />
      </Route>
      <Route path="/trips/:id" element={<TripDetailPage />} />
    </Routes>
  )
}
