import { useLocation } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";

function isTokenValid() {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) return false;

  return Date.now() < localStorage.getItem("tokenExpiry");
}

function PrivateRoute() {
  const location = useLocation();

  return isTokenValid() ? (
    <Outlet />
  ) : (
    <Navigate
      replace={true}
      to="/login"
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}

export default PrivateRoute;

// TODO: change log in route to include the user's role so we know what to render