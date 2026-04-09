import PaginatedList from "../../components/PaginatedList";
import UserJobsListComponent from "./UserJobsListComponent";
import BusinessJobListComponent from "./BusinessJobsListComponent";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const allJobsInitialFilters = {
  position_type_id: "",
  business_id: "",
  sort: "start_time",
  order: "asc",
  lat: "",
  lon: "",
};

const businessMyJobsInitialFilters = {
  position_type_id: "",
  salary_min: "",
  salary_max: "",
  start_time: "",
  end_time: "",
  status: ["open", "filled"],
};

const allJobsFilters = (filters) => {
  const hasLocation = filters.lat && filters.lon;

  return [
    { type: "location", key: "location", label: "Location" },
    {
      type: "position_type",
      key: "position_type_id",
      label: "Position Type",
    },
    {
      type: "business",
      key: "business_id",
      label: "Business",
    },
    {
      type: "select",
      key: "sort",
      label: "Sort by",
      options: [
        { value: "start_time", label: "Default (start time)" },
        { value: "updatedAt", label: "Updated At" },
        { value: "salary_min", label: "Salary Min" },
        { value: "salary_max", label: "Salary Max" },
        ...(hasLocation
          ? [
              { value: "distance", label: "Distance" },
              { value: "eta", label: "ETA" },
            ]
          : []),
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
};

const businessJobFilters = [
  {
    type: "position_type",
    key: "position_type_id",
    label: "Position Type",
  },
  {
    type: "number",
    key: "salary_min",
    label: "Minimum Salary",
  },
  {
    type: "number",
    key: "salary_max",
    label: "Maximum Salary",
  },
  {
    type: "date",
    key: "start_time",
    label: "Start Time",
  },
  {
    type: "date",
    key: "end_time",
    label: "End Time",
  },
  {
    type: "multiselect",
    key: "status",
    label: "Status",
    options: [
      { value: "open", label: "Open" },
      { value: "expired", label: "Expired" },
      { value: "filled", label: "Filled" },
      { value: "cancelled", label: "Cancelled" },
      { value: "completed", label: "Completed" },
    ],
  },
];

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Jobs() {
  const role = localStorage.getItem("role");
  const isRegular = role === "regular";

  const initialFilters = isRegular
    ? allJobsInitialFilters
    : businessMyJobsInitialFilters;

  const filterConfig = isRegular ? allJobsFilters : businessJobFilters;

  const endpoint = isRegular ? `${backendUrl}/jobs` : `${backendUrl}/businesses/me/jobs`;
  const [location, setLocation] = useState({});
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h1>{role === "regular" ? "Open jobs" : "My jobs"}</h1>
        {role === "business" ? (
          <button
            className="btn"
            onClick={() => navigate("/business/my-jobs/create")}
          >
            Create new job
          </button>
        ) : (
          <></>
        )}
      </div>
      <PaginatedList
        endpoint={endpoint}
        initialFilters={initialFilters}
        filterConfig={filterConfig}
        authentication={localStorage.getItem("token")}
        emptyMessage="No jobs found."
        renderItem={(job) => (
          <>
            {role === "regular" ? (
              <UserJobsListComponent job={job} location={location} />
            ) : (
              <BusinessJobListComponent job={job} />
            )}
          </>
        )}

        setLocation={setLocation}
      />
    </>
  );
}

export default Jobs;
