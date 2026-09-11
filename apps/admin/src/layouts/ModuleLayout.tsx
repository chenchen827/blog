import { Outlet } from "react-router";

/**
 * 所有业务模块共用的父级布局：仅渲染 <Outlet />。
 * 后续如需给所有模块增加统一的页头 / 面包屑 / 外壳,可集中在此扩展。
 */
export default function ModuleLayout() {
  return <Outlet />;
}
