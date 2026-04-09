import { Outlet, Link } from "react-router-dom";
import "./PublicLayout.css";

function PublicLayout() {
  return (
    <>
      <div className="overhead" style={{textAlign: "center"}}>
        <Link to="/">
          <h1>Temporary Staffing Platform</h1>
        </Link>
      </div>
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
    </>
  );
}

export default PublicLayout;
