import { Outlet, NavLink } from 'react-router-dom'

function TentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 21 14 3" />
      <path d="M20.5 21 10 3" />
      <path d="M15.5 21 12 15l-3.5 6" />
      <path d="M2 21h20" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

const tabs = [
  { to: '/', label: 'Trip', icon: TentIcon },
  { to: '/items', label: 'Items', icon: ListIcon },
  { to: '/past-trips', label: 'Past Trips', icon: CalendarIcon },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-slate-950">
      <main className="flex-1 pb-20 overflow-y-auto safe-top">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 safe-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`
              }
            >
              <tab.icon />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
