import { Link } from "react-router-dom";

const fields = [
  {
    key: "name",
    label: "Name",
    render: (user) => `${user.first_name} ${user.last_name}`,
  },
  {
    key: "invited",
    label: "Invited",
    render: (user) => (user.invited ? "Yes" : "No"),
  },
];

function CandidatesListComponent({ user, jobId }) {
  return (
    <Link
      to={`/business/jobs/${jobId}/candidates/${user.id}`}
      className="listComponent"
    >
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(user) : user[key]}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default CandidatesListComponent;
