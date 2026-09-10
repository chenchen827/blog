import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { User, UserProfileValues } from '../types'
import { getMe, signIn, signUp, updateUserProfile } from '../apis/auth'
import type { RegisterPayload } from '../apis/auth'
import { clearToken, getToken, saveToken } from '../lib/token'

const USER_KEY = 'blog_user'

export interface AuthContextValue {
  /** 当前登录用户；未登录为 null */
  user: User | null
  /** 是否正在初始化（读取本地用户并拉取 /users/me） */
  loading: boolean
  /** 登录 */
  login: (login: string, password: string) => Promise<void>
  /** 登出 */
  logout: () => void
  /** 注册 */
  register: (payload: RegisterPayload) => Promise<void>
  /** 更新当前用户资料并同步本地缓存 */
  updateProfile: (values: UserProfileValues) => Promise<void>
  /** 刷新当前用户信息 */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readCachedUser())
  const [loading, setLoading] = useState(true)

  const applyUser = useCallback((next: User) => {
    setUser(next)
    localStorage.setItem(USER_KEY, JSON.stringify(next))
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) {
      clearUser()
      return
    }
    try {
      const res = await getMe()
      applyUser(res.data.user)
    } catch {
      clearUser()
    }
  }, [applyUser, clearUser])

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      if (getToken()) {
        try {
          const res = await getMe()
          if (active) applyUser(res.data.user)
        } catch {
          if (active) clearUser()
        }
      }
      if (active) setLoading(false)
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [applyUser, clearUser])

  const login = useCallback(
    async (account: string, password: string) => {
      const res = await signIn(account, password)
      saveToken(res.data.token)
      const me = await getMe()
      applyUser(me.data.user)
    },
    [applyUser],
  )

  const logout = useCallback(() => {
    clearToken()
    clearUser()
  }, [clearUser])

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await signUp(payload)
      const res = await signIn(payload.username, payload.password)
      saveToken(res.data.token)
      const me = await getMe()
      applyUser(me.data.user)
    },
    [applyUser],
  )

  const updateProfile = useCallback(
    async (values: UserProfileValues) => {
      await updateUserProfile(values)
      const me = await getMe()
      applyUser(me.data.user)
    },
    [applyUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, register, updateProfile, refresh }),
    [user, loading, login, logout, register, updateProfile, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 <AuthProvider> 内使用')
  return ctx
}
