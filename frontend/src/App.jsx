import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Link } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";

import Home from "./pages/Home";
import Profile from "./pages/Profile";

import Businesses from "./pages/Businesses";
import BusinessIndex from "./pages/BusinessIndex";

import Users from "./pages/Users";

import Jobs from "./pages/Jobs";
import JobsCommitted from "./pages/JobsCommitted";
import JobIndex from "./pages/JobIndex";
import JobInterestedUsers from "./pages/JobInterestedUsers";
import CreateJob from "./pages/CreateJob";

import Candidates from "./pages/Candidates";
import CandidateInfo from "./pages/CandidateInfo";

import PositionTypes from "./pages/PositionTypes";

import Qualifications from "./pages/Qualifications";
import AdminQualificationIndex from "./pages/QualificationIndex/AdminQualificationIndex";
import CreateQualification from "./pages/CreateQualification";

import SystemSettings from "./pages/SystemSettings";
import Activate from "./pages/Login/Activate";

import Interests from "./pages/Interests";
import Invitations from "./pages/Invitations";
import Negotiation from "./pages/Negotiation";

import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import BusinessRoute from "./components/BusinessRoute";
import UserRoute from "./components/UserRoute";
import BusinessOrUserRoute from "./components/BusinessOrUserRoute";
import Unauthorised from "./components/Unauthorised";
import NotFound from "./components/NotFound";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register/:userType" element={<Register />} />
          <Route path="/activate/:token" element={<Activate />} />
          <Route path="/reset/:token" element={<ResetPassword />} />

          <Route
            path="/businesses"
            element={
              <>
                <Link to="/">Back</Link> <Businesses />
              </>
            }
          />
          <Route path="/businesses/:businessId" element={<BusinessIndex />} />
        </Route>

        {/* Routes requiring authentication */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/unauthorized" element={<Unauthorised />} />

            {/* User only routes */}
            <Route path="" element={<UserRoute />}>
              <Route path="/user/qualifications" element={<Qualifications />} />
              <Route
                path="/user/qualifications/create"
                element={<CreateQualification />}
              />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/user/my-jobs" element={<JobsCommitted />} />
              <Route path="/user/interests" element={<Interests />} />
              <Route path="/user/invitations" element={<Invitations />} />
            </Route>

            {/* Business only routes */}
            <Route path="" element={<BusinessRoute />}>
              <Route path="/business/my-jobs" element={<Jobs />} />
              <Route path="/business/my-jobs/create" element={<CreateJob />} />
              <Route
                path="/business/jobs/:jobId/interested"
                element={<JobInterestedUsers />}
              />
              <Route
                path="/business/jobs/:jobId/candidates"
                element={<Candidates />}
              />
              <Route
                path="/business/jobs/:jobId/candidates/:userId"
                element={<CandidateInfo />}
              />
            </Route>

            {/* User and business route */}
            <Route path="" element={<BusinessOrUserRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/jobs/:jobId" element={<JobIndex />} />
              <Route path="/negotiation" element={<Negotiation />} />
            </Route>

            {/* Admin only routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="businesses" element={<Businesses />} />
              <Route path="position-types" element={<PositionTypes />} />
              <Route path="qualifications" element={<Qualifications />} />
              <Route
                path="qualifications/:qualId"
                element={<AdminQualificationIndex />}
              />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
