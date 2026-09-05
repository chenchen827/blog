import type { NavChild, NavItem } from "../types/nav";
import { configs as routeConfigs } from "./configs";
import type { AppRouteObject } from "../types/route";

function joinPath(base: string, path: string): string {
  return `${base}/${path}`;
}

function resolveTo(route: AppRouteObject, base: string): string | undefined {
  if (route.index) return base === "" ? "/" : base;
  if (route.path === undefined) return undefined;
  return joinPath(base, route.path);
}

function toNavChild(route: AppRouteObject, base: string): NavChild | null {
  const meta = route.meta;
  const to = resolveTo(route, base);
  if (!meta?.label || meta.visible === false || !to) return null;
  return { label: meta.label, to };
}

function toNavItems(routes: AppRouteObject[], base = ""): NavItem[] {
  const items: NavItem[] = [];

  for (const route of routes) {
    const label = route.meta?.label;
    if (!label || route.meta?.visible === false) continue;

    const to = resolveTo(route, base);

    if (route.children) {
      const children = route.children.map((child) => toNavChild(child, to ?? base)).filter((child): child is NavChild => child !== null);
      if (children.length > 0) {
        items.push({ label, children });
        continue;
      }
    }

    if (to) {
      items.push({ label, to });
    }
  }

  return items;
}

export const navItems: NavItem[] = toNavItems(routeConfigs);
