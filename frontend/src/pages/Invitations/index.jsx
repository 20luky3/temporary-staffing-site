import PaginatedList from "../../components/PaginatedList";
import InvitationListComponent from "./InvitationListComponent";

const filterConfig = [{ type: "number", key: "limit" }];
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Invitations() {
  return (
    <>
      <h1>My invitations</h1>
      <PaginatedList
        endpoint={`${backendUrl}/users/me/invitations`}
        initialFilters={{}}
        filterConfig={filterConfig}
        authentication={localStorage.getItem("token")}
        emptyMessage="No invitations found."
        renderItem={(job) => (
          <InvitationListComponent job={job} />
        )}
      />
    </>
  );
}

export default Invitations;
