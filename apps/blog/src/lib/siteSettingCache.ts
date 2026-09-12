import type { SiteSetting } from '../types'

const SITE_SETTING_STORAGE_KEY = 'blog_site_setting'
const SITE_SETTING_UPDATED_EVENT = 'blog:site-setting-updated'

/** 读取本地缓存的网站信息。 */
export function getCachedSiteSetting(): SiteSetting | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(SITE_SETTING_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SiteSetting
  } catch {
    return null
  }
}

/** 写入网站信息缓存，并通知同页面的订阅者。 */
export function setCachedSiteSetting(setting: SiteSetting): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SITE_SETTING_STORAGE_KEY, JSON.stringify(setting))
    window.dispatchEvent(new Event(SITE_SETTING_UPDATED_EVENT))
  } catch {
    // localStorage 不可用时保持页面当前状态。
  }
}

/** 订阅同页面或跨标签页的网站信息缓存更新。 */
export function subscribeSiteSetting(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  const onStorage = (event: StorageEvent) => {
    if (event.key === SITE_SETTING_STORAGE_KEY) callback()
  }

  window.addEventListener(SITE_SETTING_UPDATED_EVENT, callback)
  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener(SITE_SETTING_UPDATED_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}