import type { Personalization } from "../apis/personalization";

const PERSONALIZATION_KEY = "blog_personalization";

export function getCachedPersonalization(): Personalization | null {
  try {
    const raw = localStorage.getItem(PERSONALIZATION_KEY);
    return raw ? (JSON.parse(raw) as Personalization) : null;
  } catch {
    return null;
  }
}

export function setCachedPersonalization(personalization: Personalization | null): void {
  try {
    if (personalization) {
      localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(personalization));
    } else {
      localStorage.removeItem(PERSONALIZATION_KEY);
    }
  } catch {
    // 本地缓存不可用时静默失败，不影响接口数据使用
  }
}
