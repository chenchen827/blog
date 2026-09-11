import type { UserMenuUser } from "@repo/shared";

import type { User } from "../types";

export function toMenuUser(user: User | null): UserMenuUser | undefined {
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.nickname || user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    sex: user.sex,
    company: user.company,
    introduce: user.introduce,
  };
}