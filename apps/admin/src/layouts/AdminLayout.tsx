import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'

import { navItems } from '../nav'
import type { NavItem } from '../types/nav'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const rowClasses =
  'flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm transition-colors'
const rowIdle = 'text-on-primary hover:bg-white/10'
const rowActive = 'text-accent-cyan'

function getGroupBase(item: NavItem): string | undefined {
  const first = item.children?.[0]
  if (!first) return undefined
  return `/${first.to.split('/')[1] ?? ''}`
}

function isGroupActive(item: NavItem, pathname: string): boolean {
  return item.children?.some((child) => child.to === pathname) ?? false
}

interface LeafLinkProps {
  to: string
  label: string
  onNavigate?: () => void
}

function LeafLink({ to, label, onNavigate }: LeafLinkProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) => cx(rowClasses, isActive ? rowActive : rowIdle)}
    >
      {label}
    </NavLink>
  )
}

interface NavListProps {
  onNavigate?: () => void
}

function NavList({ onNavigate }: NavListProps) {
  const { pathname } = useLocation()
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    navItems
      .filter(
        (item) =>
          (item.children?.length ?? 0) > 1 && isGroupActive(item, window.location.pathname),
      )
      .map((item) => getGroupBase(item)!),
  )

  function toggleGroup(base: string) {
    setOpenGroups((prev) =>
      prev.includes(base) ? prev.filter((b) => b !== base) : [...prev, base],
    )
  }

  return (
    <nav aria-label="主导航" className="space-y-1 px-2 py-4">
      {navItems.map((item) => {
        const children = item.children ?? []
        if (children.length > 1) {
          const base = getGroupBase(item)!
          const open = openGroups.includes(base) || isGroupActive(item, pathname)
          return (
            <div key={item.label}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggleGroup(base)}
                className={cx(rowClasses, 'justify-between text-on-primary hover:bg-white/10')}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={cx('text-xs transition-transform duration-200', open && 'rotate-180')}
                >
                  ▾
                </span>
              </button>
              {open && (
                <ul className="mt-1 space-y-1 pl-3">
                  {children.map((child) => (
                    <li key={child.to}>
                      <LeafLink to={child.to} label={child.label} onNavigate={onNavigate} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        }
        if (children.length === 1) {
          return (
            <LeafLink
              key={item.label}
              to={children[0].to}
              label={item.label}
              onNavigate={onNavigate}
            />
          )
        }
        return <LeafLink key={item.label} to={item.to!} label={item.label} onNavigate={onNavigate} />
      })}
    </nav>
  )
}

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-on-primary">
      <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-hairline bg-canvas px-4 md:gap-4 md:px-6">
        <button
          type="button"
          aria-label="打开菜单"
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-soft text-on-primary transition-colors hover:bg-white/20 xl:hidden"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ☰
          </span>
        </button>
        <Link
          to="/"
          className="hidden shrink-0 text-lg font-semibold tracking-tight text-on-primary md:inline"
        >
          BLOG ADMIN
        </Link>
        <Link
          to="/login"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-surface-soft px-5 text-base font-semibold text-on-primary transition-[filter] hover:brightness-125"
        >
          登录
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 text-base font-semibold text-on-primary transition-colors hover:bg-white/10"
        >
          登出
        </button>
      </header>
      <div className="flex flex-1 items-stretch">
        <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-60 shrink-0 overflow-y-auto border-r border-hairline bg-primary xl:block">
          <NavList />
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={closeMenu}
            className="absolute inset-0 h-full w-full cursor-default bg-overlay-scrim/70"
          />
          <aside className="absolute inset-y-0 left-0 flex w-60 flex-col overflow-y-auto border-r border-hairline bg-primary">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-base font-semibold">BLOG ADMIN</span>
              <button
                type="button"
                aria-label="关闭菜单"
                onClick={closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-on-primary transition-colors hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <NavList onNavigate={closeMenu} />
          </aside>
        </div>
      )}
    </div>
  )
}

