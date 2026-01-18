import { memo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./home";
import ModuleTask from "./ModuleTask";
import ModuleTest from "./ModuleTest";
import AdminPage from "./Admin";
import MainLayout from "../components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";


const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "module/:moduleId/task/:taskNumber", element: <ProtectedRoute><ModuleTask /></ProtectedRoute> },
      { path: "module/:moduleId/test", element: <ProtectedRoute><ModuleTest /></ProtectedRoute> },
      { path: "admin", element: <AdminPage /> },
    ],
  },
]);

const AppRouter = memo(() => {
  return (
    <RouterProvider router={router} />
  );
});

export default memo(AppRouter);
