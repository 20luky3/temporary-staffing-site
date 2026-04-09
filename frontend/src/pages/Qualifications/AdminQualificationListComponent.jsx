import { Link } from "react-router-dom";

const fields = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "user",
    label: "User",
    render: (qual) =>
      `${qual.user?.first_name} ${qual.user?.last_name} (ID: ${qual.user?.id})`,
  },
  {
    key: "position_type",
    label: "Position type",
    render: (qual) =>
      `${qual.position_type?.name} (ID: ${qual.position_type?.id})`,
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "updatedAt",
    label: "Last updated",
    render: (qual) => {
    const date = new Date(qual.updatedAt);
    return date.toLocaleString();
  },
  },
];

function AdminQualificationListComponent({ qual }) {
  return (
    <Link to={`/admin/qualifications/${qual.id}`} className="listComponent">
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(qual) : qual[key]}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default AdminQualificationListComponent;
