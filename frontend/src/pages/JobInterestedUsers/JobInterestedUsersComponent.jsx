import { Link } from "react-router-dom";

const fields = [
  {
    key: "name",
    label: "Name",
    render: (interest) =>
      `${interest.user.first_name} ${interest.user.last_name}`,
  },
  {
    key: "mutual",
    label: "Mutual",
    render: (interest) => (interest.mutual ? "Yes" : "No"),
  },
];

function JobInterestedUsersComponent({ interest, jobId, onSelect }) {
  return (
    <>
    <input type="radio"
      onChange={() => onSelect(interest.interest_id)}
    />
    <Link
      to={`/business/jobs/${jobId}/candidates/${interest.user.id}`}
      className="listComponent"
    >
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong>{" "}
            {render ? render(interest) : interest[key]}
          </li>
        ))}
      </ul>
    </Link></>
  );
}

export default JobInterestedUsersComponent;
