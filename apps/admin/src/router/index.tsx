import { createBrowserRouter } from "react-router";

import type { AppRouteObject } from "../types/route";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import { configs } from "./configs";

const routers: AppRouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <AdminLayout />,
    children: configs,
  },
];

const basename = import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(routers, { basename });
