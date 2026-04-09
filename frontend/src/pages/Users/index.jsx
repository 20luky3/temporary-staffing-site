import PaginatedList from "../../components/PaginatedList";
import UserListComponent from "./UserListComponent";
import "./UserListComponent.css"

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Users() {
  const initialFilters = {
    keyword: "",
    activated: "",
    suspended: "",
  };

  const filterConfig = [
    { type: "text", key: "keyword", label: "Search..." },
    {
      type: "number",
      key: "limit",
    },
    {
      type: "select",
      key: "activated",
      label: "Activated",
      options: [
        { value: "", label: "All" },
        { value: true, label: "Activated" },
        { value: false, label: "Not Activated" },
      ],
    },
    {
      type: "select",
      key: "suspended",
      label: "Suspended",
      options: [
        { value: "", label: "All" },
        { value: true, label: "Suspended" },
        { value: false, label: "Not Suspended" },
      ],
    },
  ];

  const token = localStorage.getItem("token");
  return (
    <>
      <h1>Users</h1>
      <PaginatedList
        endpoint={`${backendUrl}/users`}
        initialFilters={initialFilters}
        filterConfig={filterConfig}
        authentication={token}
        emptyMessage="No users found."
        renderItem={(u) => <UserListComponent user={u} />}
      />
    </>
  );
}

export default Users;
