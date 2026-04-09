import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const role = localStorage.getItem("role");

  return role === "admin" ? (
    <div className="home-box">
      <h1>Administrator controls</h1>
      <Link to="/admin/users">Users</Link>
      <Link to="/admin/businesses">Businesses</Link>
      <Link to="/admin/position-types">Position types</Link>
      <Link to="/admin/qualifications">Qualifications</Link>
      <Link to="/admin/settings">System settings</Link>
    </div>
  ) : (
    <>
      <h1>
        Welcome to the temporary staffing platform! Use the navigation bar to
        get started.
      </h1>
    </>
  );
}

export default Home;
