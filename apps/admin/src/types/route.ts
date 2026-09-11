import type { IndexRouteObject, NonIndexRouteObject } from "react-router";

export interface RouteMeta {
  label: string;
  /** false 时不在侧边栏菜单展示,路由仍可访问 */
  visible?: boolean;
}

export interface AppIndexRouteObject extends Omit<IndexRouteObject, "children"> {
  meta?: RouteMeta;
  children?: undefined;
}

export interface AppNonIndexRouteObject extends Omit<NonIndexRouteObject, "children"> {
  meta?: RouteMeta;
  children?: AppRouteObject[];
}

export type AppRouteObject = AppIndexRouteObject | AppNonIndexRouteObject;
