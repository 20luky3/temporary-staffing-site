import { Link } from "react-router-dom";

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
    key: "postal_address",
    label: "Postal address",
  },
  {
    key: "phone_number",
    label: "Phone number",
  },
];

function BusinessListComponent({ business }) {
  return (
    <Link to={`/businesses/${business.id}`} className="listComponent">
      <ul>
        {userFields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong>{" "}
            {render ? render(business) : business[key]}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default BusinessListComponent;
