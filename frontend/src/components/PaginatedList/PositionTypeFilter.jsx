import { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PositionTypeFilter({ value, setValue }) {
  const [positionTypes, setPositionTypes] = useState([]);

  useEffect(() => {
    async function getPositionTypes() {
      const response = await fetch(`${backendUrl}/position-types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setPositionTypes(data.results);
    }

    getPositionTypes();
  }, []);

  return (
    <div>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value=""></option>
        {positionTypes.map((pt) => (
          <option key={pt.id} value={pt.id}>
            {pt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PositionTypeFilter;
