import PaginatedList from "../../components/PaginatedList";
import UserQualificationListComponent from "./UserQualificationListComponent";
import AdminQualificationListComponent from "./AdminQualificationListComponent";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Qualifications() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const isAdmin = role === "admin";

  const initialFilters = isAdmin
    ? {
        keyword: "",
      }
    : {
        status: "",
      };

  let filterConfig = isAdmin
    ? [
        { type: "text", key: "keyword", label: "Search..." },
        {
          type: "number",
          key: "limit",
        },
      ]
    : [
        {
          type: "select",
          key: "status",
          label: "Status",
          options: [
            { value: "", label: "All" },
            { value: "created", label: "Created" },
            { value: "submitted", label: "Submitted" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "revised", label: "Revised" },
          ],
        },
        {
          type: "number",
          key: "limit",
        },
      ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1>
          {isAdmin ? "Qualification requests" : "My qualification requests"}
        </h1>
        {!isAdmin ? (
          <button
            className="btn"
            onClick={() => navigate("/user/qualifications/create")}
          >
            Create new request
          </button>
        ) : (
          <></>
        )}
      </div>
      <PaginatedList
        endpoint={
          isAdmin ? `${backendUrl}/qualifications` : `${backendUrl}/users/me/qualifications`
        }
        initialFilters={initialFilters}
        filterConfig={filterConfig}
        authentication={token}
        emptyMessage="No qualification requests found."
        renderItem={(q) =>
          isAdmin ? (
            <AdminQualificationListComponent qual={q} />
          ) : (
            <UserQualificationListComponent qualification={q} />
          )
        }
      />
    </>
  );
}

export default Qualifications;
