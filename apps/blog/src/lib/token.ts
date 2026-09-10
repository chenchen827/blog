/** 普通用户登录 token 在本地缓存中的存储键 */
export const TOKEN_KEY = 'blog_user_token'

/** 从本地缓存读取用户登录 token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** 将登录成功后返回的 token 写入本地缓存 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/** 清除本地缓存中的 token */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
