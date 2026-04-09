import { Link } from "react-router-dom";

const fields = [
  {
    key: "position_type",
    label: "Position type",
    render: (job) => job.position_type?.name,
  },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "salary",
    label: "Salary",
    render: (job) => `$${job.salary_min} - $${job.salary_max}`,
  },
  {
    key: "work_time_window",
    label: "Work time window",
    render: (job) => {
      const start = new Date(job.start_time);
      const end = new Date(job.end_time);

      return `${start.toLocaleString()} to ${end.toLocaleString()}`;
    },
  },
];

function BusinessJobListComponent({ job }) {
    return (
    <Link to={`/jobs/${job.id}`} className="listComponent">
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(job) : job[key]}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default BusinessJobListComponent;
