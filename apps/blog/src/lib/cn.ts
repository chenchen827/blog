/** 合并类名：过滤 falsy 后以空格连接 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}
