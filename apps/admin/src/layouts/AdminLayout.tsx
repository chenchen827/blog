import { Link, Outlet } from 'react-router'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            Admin
          </Link>
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link to="/settings" className="text-sm text-slate-600 hover:text-slate-900">
            Settings
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
