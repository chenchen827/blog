/** 拥有完整后台权限的角色值 */
export const ADMIN_ROLE = 100

/** 仅 role = 100 可见的菜单分组名称 */
export const ADMIN_ONLY_MENU_LABELS = new Set(['用户管理', '会员商品', '系统设置', '分类管理', '附件管理', '错误日志'])

/** 仅 role = 100 可访问的路径前缀 */
export const ADMIN_ONLY_PATH_PREFIXES = ['/users', '/memberships', '/settings', '/categories', '/attachments', '/error-logs']

/** 判断指定路径是否命中仅管理员可访问的模块 */
export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

/** 判断角色是否拥有完整后台权限 */
export function isAdminRole(role: number | null | undefined): boolean {
  return Number(role) === ADMIN_ROLE
}