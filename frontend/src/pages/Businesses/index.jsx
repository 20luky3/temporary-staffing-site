import "./BusinessListComponent.css";
import PaginatedList from "../../components/PaginatedList";
import AdminBusinessListComponent from "./AdminBusinessListComponent";
import BusinessListComponent from "./BusinessListComponent";

function Businesses() {
  const role = localStorage.getItem("role");

  let initialFilters = {
    keyword: "",
    sort: "",
    order: "asc",
  };

  let filterConfig = [
    { type: "text", key: "keyword", label: "Search..." },
    {
      type: "select",
      key: "sort",
      label: "Sorting",
      options: [
        { value: "", label: "None" },
        { value: "business_name", label: "Business Name" },
        { value: "email", label: "Email" },
      ],
    },
    {
      type: "select",
      key: "order",
      label: "Order",
      options: [
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ],
    },
    {
      type: "number",
      key: "limit",
    },
  ];

  // modify initialFilters and filterConfig if the user is an admin
  if (role === "admin") {
    initialFilters = {
      ...initialFilters,
      verified: "",
      activated: "",
    };

    // add "owner_name" to sort
    filterConfig[1].options.push({ value: "owner_name", label: "Owner name" });

    // add inputs for verified and activated
    filterConfig.push({
      type: "select",
      key: "activated",
      label: "Activated",
      options: [
        { value: "", label: "All" },
        { value: true, label: "Activated" },
        { value: false, label: "Not Activated" },
      ],
    });

    filterConfig.push({
      type: "select",
      key: "verified",
      label: "Verified",
      options: [
        { value: "", label: "All" },
        { value: true, label: "Verified" },
        { value: false, label: "Not Verified" },
      ],
    });
  }

  const token = localStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  return (
    <>
      <h1>Businesses</h1>
      <PaginatedList
        endpoint={`${backendUrl}/businesses`}
        initialFilters={initialFilters}
        filterConfig={filterConfig}
        authentication={token}
        emptyMessage="No businesses found."
        renderItem={(b) => (
          <>
            {role === "admin" ? (
              <AdminBusinessListComponent business={b} />
            ) : (
              <BusinessListComponent business={b} />
            )}
          </>
        )}
      />
    </>
  );
}

export default Businesses;
