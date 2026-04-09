import PaginatedList from "../../components/PaginatedList";
import PositionTypeListComponent from "./PositionTypeListComponent";
import CreatePositionType from "./CreatePositionType";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PositionTypes({ onSelect }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  let initialFilters = {
    keyword: "",
    name: "asc",
  };

  let filterConfig = [
    { type: "text", key: "keyword", label: "Search..." },
    {
      type: "select",
      key: "name",
      label: "Name",
      options: [
        { value: "asc", label: "Ascending (A to Z)" },
        { value: "desc", label: "Descending (Z to A)" },
      ],
    },
  ];

  // modify filters if user is an admin
  if (role === "admin") {
    initialFilters = {
      ...initialFilters,
      hidden: "",
      num_qualified: "",
    };

    // add inputs for hidden and num_qualified
    filterConfig = [
      ...filterConfig,
      {
        type: "select",
        key: "hidden",
        label: "Hidden",
        options: [
          { value: "", label: "All" },
          { value: true, label: "Hidden" },
          { value: false, label: "Not Hidden" },
        ],
      },
      {
        type: "select",
        key: "num_qualified",
        label: "Amount qualified",
        options: [
          { value: "asc", label: "Ascending" },
          { value: "desc", label: "Descending" },
        ],
      },
    ];
  }

  return (
    <>
      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        {role === "admin" ? <h1>Position types</h1> : <></>}
        {role === "admin" ? (
          <button className="btn" onClick={() => setShowCreate(true)}>
            Create position type
          </button>
        ) : (
          <></>
        )}
      </div>
      {showCreate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreatePositionType
              onUpdate={() => setRefreshKey((prev) => prev + 1)}
              onClose={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}

      <PaginatedList
        key={refreshKey}
        endpoint={`${backendUrl}/position-types`}
        initialFilters={initialFilters}
        filterConfig={filterConfig}
        authentication={token}
        emptyMessage="No position types found."
        renderItem={(p) => (
          <>
            {role === "admin" ? (
              <PositionTypeListComponent
                positionType={p}
                onDelete={() => setRefreshKey((prev) => prev + 1)}
              />
            ) : (
              <label>
                <input
                  type="radio"
                  name="positionType"
                  value={p.id}
                  onChange={() => onSelect(p.id)}
                />
                {p.name} - {p.description}
              </label>
            )}
          </>
        )}
      />
    </>
  );
}

export default PositionTypes;
