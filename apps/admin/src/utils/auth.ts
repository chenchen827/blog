/** 管理员登录 token 在本地缓存中的存储键 */
export const TOKEN_KEY = "blog_admin_token";

/** 当前管理员角色在本地缓存中的存储键 */
export const ROLE_KEY = "blog_admin_role";

/** 从本地缓存读取管理员登录 token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** 将登录成功后返回的 token 写入本地缓存 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** 缓存当前管理员的角色,避免每次刷新都重新请求 */
export function saveRole(role: number): void {
  localStorage.setItem(ROLE_KEY, String(role));
}

/** 读取缓存的管理员角色 */
export function getCachedRole(): number | null {
  const value = localStorage.getItem(ROLE_KEY);
  if (!value) return null;
  const role = Number(value);
  return Number.isFinite(role) ? role : null;
}

/** 仅清除缓存的管理员角色 */
export function clearRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

/** 清除本地缓存中的 token 与角色 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  clearRole();
}
