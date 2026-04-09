import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminRoute;
