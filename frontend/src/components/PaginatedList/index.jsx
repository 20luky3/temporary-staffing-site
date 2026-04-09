import { useState, useEffect } from "react";
import "./PaginatedList.css";
import MultiSelectDropdown from "./MutliSelectDropdown";
import PositionTypeFilter from "./PositionTypeFilter";
import BusinessFilter from "./BusinessFilter";

function PaginatedList({
  endpoint,
  initialFilters,
  renderItem,
  filterConfig,
  authentication,
  emptyMessage,
  setLocation,
}) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [locationLoading, setLocationLoading] = useState(false);

  // fetch list from backend
  useEffect(() => {
    async function fetchList() {
      const queryObj = { page, limit, ...filters };

      Object.keys(queryObj).forEach((key) => {
        if (queryObj[key] === "" || queryObj[key] == null) {
          delete queryObj[key];
        }
      });

      const query = new URLSearchParams();

      Object.entries(queryObj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else {
          query.append(key, value);
        }
      });

      let response;

      if (!authentication) {
        // authentication header not provided
        response = await fetch(`${endpoint}?${query}`);
      } else {
        response = await fetch(`${endpoint}?${query}`, {
          headers: { Authorization: `Bearer ${authentication}` },
        });
      }

      const data = await response.json();

      setList(data.results);
      setTotal(data.count);
    }

    fetchList();
  }, [endpoint, filters, page, limit, authentication]);

  const resolvedFilters =
    typeof filterConfig === "function" ? filterConfig(filters) : filterConfig;

  return (
    <>
      {/* Filters */}
      <div className="filters">
        {resolvedFilters.map((filter) => {
          if (filter.type === "text") {
            return (
              <div key={filter.key}>
                <label>Keyword search</label>
                <input
                  placeholder={filter.label}
                  value={filters[filter.key] || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "select") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <select
                  value={filters[filter.key] || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (filter.key === "limit") {
            return (
              <div key={filter.key}>
                <label>Limit per page</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
            );
          }

          if (filter.type === "number") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <input
                  type="number"
                  value={filters[filter.key] || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "date") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <input
                  type="date"
                  value={filters[filter.key] || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "multiselect") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <MultiSelectDropdown
                  options={filter.options}
                  initialValues={filter.initialValues}
                  value={filters[filter.key] || []}
                  onChange={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: val,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "position_type") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <PositionTypeFilter
                  value={filters[filter.key] || {}}
                  setValue={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: val,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "business") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <BusinessFilter
                  value={filters[filter.key] || {}}
                  setValue={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      [filter.key]: val,
                    }))
                  }
                />
              </div>
            );
          }

          if (filter.type === "location") {
            return (
              <div key={filter.key}>
                <label>{filter.label}</label>
                <button
                  type="button"
                  className="btn"
                  disabled={locationLoading}
                  onClick={() => {
                    // remove lat and lon from filters if set
                    if (filters.lat && filters.lon) {
                      setFilters((prev) => ({
                        ...prev,
                        lat: "",
                        lon: "",
                      }));

                      setLocation({});

                      return;
                    }

                    if (!navigator.geolocation) {
                      return;
                    }

                    setLocationLoading(true);

                    navigator.geolocation.getCurrentPosition((position) => {
                      const lat = position.coords.latitude;
                      const lon = position.coords.longitude;
                      setFilters((prev) => ({
                        ...prev,
                        lat: lat,
                        lon: lon,
                      }));

                      setLocation({
                        lat: lat,
                        lon: lon,
                      });
                      setLocationLoading(false);
                    });
                  }}
                >
                  {locationLoading
                    ? "Getting location..."
                    : filters.lat && filters.lon
                      ? "Remove location"
                      : "Use my location"}
                </button>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* List */}
      {/* If the list is empty, render the empty message */}
      {list.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <ul>
          {list.map((item) => (
            <li key={item.id}>{renderItem(item)}</li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="pagination-box">
        <button
          className="btn"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
        >
          Prev
        </button>

        <span>
          Page {page} of {Math.ceil(total / limit)}
        </span>

        <button
          className="btn"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === Math.ceil(total / limit)}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default PaginatedList;
