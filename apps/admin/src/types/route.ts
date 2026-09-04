import type { IndexRouteObject, NonIndexRouteObject } from "react-router";

export interface RouteMeta {
  label: string;
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
