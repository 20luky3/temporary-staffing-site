import PaginatedList from "../../components/PaginatedList";
import { useParams } from "react-router-dom";
import CandidatesListComponent from "./CandidatesListComponent";

const filterConfig = [{ type: "number", key: "limit" }];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Candidates() {
  const { jobId } = useParams();

  return (
    <>
      <h1>Discoverable candidates</h1>
      <PaginatedList
        endpoint={`${backendUrl}/jobs/${jobId}/candidates`}
        initialFilters={{}}
        filterConfig={filterConfig}
        authentication={localStorage.getItem("token")}
        emptyMessage="No discoverable candidates found."
        renderItem={(user) => (
          <CandidatesListComponent user={user} jobId={jobId} />
        )}
      />
    </>
  );
}

export default Candidates;
