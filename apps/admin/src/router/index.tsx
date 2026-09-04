import { createBrowserRouter } from "react-router";

import type { AppRouteObject } from "../types/route";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/login";
import { configs } from "./configs";

const routers: AppRouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AdminLayout />,
    children: configs,
  },
];

export const router = createBrowserRouter(routers);
