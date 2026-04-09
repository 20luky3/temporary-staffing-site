import PaginatedList from "../../components/PaginatedList";
import InterestListComponent from "./InterestListComponent";

const filterConfig = [{ type: "number", key: "limit" }];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Interests() {
  return (
    <>
      <h1>My interests</h1>
      <PaginatedList
        endpoint={`${backendUrl}/users/me/interests`}
        initialFilters={{}}
        filterConfig={filterConfig}
        authentication={localStorage.getItem("token")}
        emptyMessage="No interested jobs found."
        renderItem={(interest) => <InterestListComponent interest={interest} />}
      />
    </>
  );
}

export default Interests;
