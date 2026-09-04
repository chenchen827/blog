import { Link, Outlet } from 'react-router'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
          <Link to="/" className="text-lg font-black uppercase tracking-wide text-text-primary">
            My Blog
          </Link>
          <Link to="/" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
            Home
          </Link>
          <Link to="/posts/1" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
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
