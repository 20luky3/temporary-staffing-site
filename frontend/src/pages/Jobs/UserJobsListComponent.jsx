import { Link } from "react-router-dom";

const fields = [
  {
    key: "business_name",
    label: "Business name",
    render: (job) => job.business?.business_name,
  },
  {
    key: "position_type",
    label: "Position type",
    render: (job) => job.position_type?.name,
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
  {
    key: "updatedAt",
    label: "Last updated",
    render: (job) => {
      const date = new Date(job.updatedAt);
      return date.toLocaleString();
    }
  }
];

const optionalFields = [
  {
    key: "distance",
    label: "Distance",
    render: (job) => `${Math.round(job.distance * 100) / 100} kilometers`,
  },
  {
    key: "eta",
    label: "Estimated travel time",
    render: (job) => `${Math.round(job.eta * 100) / 100} minutes`,
  },
];

function UserJobsListComponent({ job, location }) {
  const hasLocation = job.eta != null && job.distance != null;

  return (
    <Link
      to={
        hasLocation
          ? `/jobs/${job.id}?lat=${location.lat}&lon=${location.lon}`
          : `/jobs/${job.id}`
      }
      className="listComponent"
    >
      <ul>
        {fields.map(({ key, label, render }) => (
          <li key={key}>
            <strong>{label}:</strong> {render ? render(job) : job[key]}
          </li>
        ))}

        {/* Include eta and distance if they are specified */}
        {job.eta && job.distance ? (
          optionalFields.map(({ key, label, render }) => (
            <li key={key}>
              <strong>{label}:</strong> {render ? render(job) : job[key]}
            </li>
          ))
        ) : (
          <></>
        )}
      </ul>
    </Link>
  );
}

export default UserJobsListComponent;
