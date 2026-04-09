import { Link } from "react-router-dom";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { useState, useEffect } from "react";
import { disconnectSocket } from "../../socket";

const items = {
  regular: [
    { label: "Jobs", path: "/jobs" },
    { label: "Negotiation", path: "/negotiation" },
  ],
  business: [
    { label: "My Jobs", path: "/business/my-jobs" },
    { label: "Negotiation", path: "/negotiation" },
  ],
  admin: [{ label: "Home", path: "/home" }],
};

const sidePopupItems = {
  regular: [
    { name: "Profile", link: "/profile" },
    { name: "My jobs", link: "/user/my-jobs" },
    { name: "My interests", link: "/user/interests" },
    { name: "Qualifications", link: "/user/qualifications" },
    { name: "Invitations", link: "/user/invitations" },
  ],
  business: [{ name: "Profile", link: "/profile" }],
};

function Navbar() {
  const [openPopup, setOpenPopup] = useState(false);
  const role = localStorage.getItem("role");
  const navItems = items[role];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("role");

    disconnectSocket(); // disconnect socket, if there was one

    navigate("/"); // redirect to home or login
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".side-icon")) {
        setOpenPopup(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav>
      <ul className="navItems">
        {/* <Link to={navItem[1]}>{navItem[0]}</Link> */}
        {navItems.map(({ label, path }) => {
          return (
            <li key={label}>
              <Link to={path}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* if business or regular, user icon */}
      <div className="side-icon">
        {role !== "admin" ? (
          <>
            <CgProfile
              className="profile-icon"
              onClick={() => setOpenPopup((prev) => !prev)}
            />

            {openPopup && (
              <div className="profile-popup">
                <ul>
                  {sidePopupItems[role].map((item) => {
                    return (
                      <li key={item.name}>
                        <Link
                          onClick={() => setOpenPopup((prev) => !prev)}
                          to={item.link}
                        >
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                  <li
                    key="logout"
                    style={{ paddingTop: "10px", cursor: "pointer" }}
                    onClick={handleLogout}
                  >
                    Log out
                  </li>
                </ul>
              </div>
            )}
          </>
        ) : (
          // if admin, "log out"
          <>
            <button onClick={() => handleLogout()}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
