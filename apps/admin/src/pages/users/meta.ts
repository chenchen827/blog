/** 角色枚举展示 */
export function roleText(role: number | string | undefined): string {
  const value = Number(role)
  if (value === 100) return '管理员'
  if (value === 10) return '会员'
  return '普通用户'
}

/** 性别枚举展示 */
export function sexText(sex: number | string | undefined): string {
  const value = Number(sex)
  if (value === 0) return '男'
  if (value === 1) return '女'
  return '保密'
}

/** 邮箱/手机号等可空字段展示 */
export function emptyText(value?: string | null): string {
  return value ? value : '—'
}