import PaginatedList from "../../components/PaginatedList";
import JobListComponent from "./JobListComponent";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function JobsCommitted() {
  return (
    <>
      <h1>My jobs</h1>
      <PaginatedList
        endpoint={`${backendUrl}/users/me/jobs`}
        initialFilters={{}}
        filterConfig={[
          {
            type: "number",
            key: "limit",
          },
        ]}
        authentication={localStorage.getItem("token")}
        emptyMessage="No committed jobs found."
        renderItem={(job) => <JobListComponent job={job}/>}
      />
    </>
  );
}

export default JobsCommitted;
