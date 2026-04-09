import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const userFields = [
  {
    key: "business_name",
    label: "Business name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "location",
    label: "Location",
    render: (business) => {
      if (!business.location) return <></>;

      const location = business.location;
      const url = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=15/${location.lat}/${location.lon}`;

      return (
        <a href={url} target="_blank">
          View location here
        </a>
      );
    },
  },
  {
    key: "postal_address",
    label: "Postal address",
  },
  {
    key: "phone_number",
    label: "Phone number",
  },
  {
    key: "biography",
    label: "Biography",
    render: (business) =>
      business.biography ? business.biography : "No biography provided",
  },
];

function BusinessIndex() {
  const [business, setBusiness] = useState({});

  const { businessId } = useParams();

  useEffect(() => {
    async function fetchBusiness() {
      const response = await fetch(`${backendUrl}/businesses/${businessId}`);
      const data = await response.json();

      setBusiness(data);
    }

    fetchBusiness();
  }, [businessId]);

  return (
    <>
      <Link to="/businesses">Back</Link>
      <div className="profileComponent" style={{ paddingTop: "10px" }}>
        {business.avatar ? (
          <img
            src={`${backendUrl}/${business.avatar}`}
            alt="Business avatar image"
            className="avatar"
          />
        ) : (
          <CgProfile className="CgProfile" />
        )}
        <ul>
          {userFields.map(({ key, label, render }) => (
            <li key={key}>
              <strong>{label}:</strong>{" "}
              {render ? render(business) : business[key]}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default BusinessIndex;
