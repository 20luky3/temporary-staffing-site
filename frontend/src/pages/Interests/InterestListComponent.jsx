import { Link } from "react-router-dom";

const fields = [
  {
    key: "job_type",
    label: "Job type",
    render: (interest) => interest.job.position_type.name,
  },
  {
    key: "business",
    label: "Business",
    render: (interest) => interest.job.business.business_name,
  },
  {
    key: "salary",
    label: "Salary",
    render: (interest) => `$${interest.job.salary_min} - $${interest.job.salary_max}`,
  },
  {
    key: "work_time_window",
    label: "Work time window",
    render: (interest) => {
      const start = new Date(interest.job.start_time);
      const end = new Date(interest.job.end_time);

      return `${start.toLocaleString()} to ${end.toLocaleString()}`;
    },
  },
  {
    key: "mutual",
    label: "Mutual interest",
    render: (interest) => (interest.mutual ? "Yes" : "No"),
  },
];

function InterestListComponent({ interest }) {
  return (
    <Link to={`/jobs/${interest.job.id}`} className="listComponent">
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong>{" "}
            {render ? render(interest) : interest[key]}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default InterestListComponent;
