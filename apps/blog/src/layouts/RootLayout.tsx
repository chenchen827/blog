import { Link, Outlet } from 'react-router'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            My Blog
          </Link>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/posts/1" className="text-sm text-gray-600 hover:text-gray-900">
            Sample Post
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
