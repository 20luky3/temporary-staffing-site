import { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function BusinessFilter({ value, setValue }) {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    async function getBusinesses() {
      const response = await fetch(`${backendUrl}/businesses`, {
      });

      const data = await response.json();
      setBusinesses(data.results);
    }

    getBusinesses();
  }, []);

  return (
    <div>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value=""></option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.business_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default BusinessFilter;
