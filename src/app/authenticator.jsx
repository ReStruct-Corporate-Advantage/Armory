import React, {useEffect} from "react";
import {connect} from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import { PageLoader } from "./components";
import { dispatchUserDetails, setLoggedIn } from "./global-actions";
import Helper from "./utils/Helper";
import Network from "./utils/network";
import ENDPOINTS from "./constants/endpoints";

const LoadableDashboard = Loadable({
  loader: () => import("./pages/Dashboard"),
  loading: PageLoader
})

const LoadableAuthorizer = Loadable({
  loader: () => import("./authorizer"),
  loading: PageLoader
})

const LoadableProjectCreator = Loadable({
  loader: () => import("./pages/ProjectCreator"),
  loading: PageLoader
})

const LoadablePageCreator = Loadable({
  loader: () => import("./pages/PageCreator"),
  loading: PageLoader
})

const LoadableComponentCreator = Loadable({
  loader: () => import("./pages/ComponentCreator"),
  loading: PageLoader
})

const LoadableComponentSelector = Loadable({
  loader: () => import("./pages/ComponentSelector"),
  loading: PageLoader
})

const LoadableForgotPassword = Loadable({
  loader: () => import("./pages/ForgotPassword"),
  loading: PageLoader
})

const LoadableUserProfile = Loadable({
  loader: () => import("./pages/UserProfile"),
  loading: PageLoader
})

const LoadableNotifications = Loadable({
  loader: () => import("./pages/Notifications"),
  loading: PageLoader
})

const LoadableSettings = Loadable({
  loader: () => import("./pages/Settings"),
  loading: PageLoader
})

const LoadableCollaborationBoard = Loadable({
  loader: () => import("./pages/CollaborationBoard"),
  loading: PageLoader
})

function Authenticator(props) {
  const { dispatchUserDetails, setLoggedIn } = props;
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      Network.get(ENDPOINTS.BE.USER.CURRENT)
        .then(res => {
          // navigate("/")
          dispatchUserDetails(res.body);
        })
        .catch(e => console.log(e));
    }
  }, [isLoggedIn]);

  return <Routes>
    <Route path="/" element={<LoadableDashboard />} />
    <Route path="manage/*" element={<LoadableAuthorizer />} />
    <Route path="project" element={<LoadableProjectCreator />} />
    <Route path="page" element={<LoadablePageCreator />} />
    <Route path="component" element={<LoadableComponentCreator />} />
    <Route path="component/view" element={<LoadableComponentSelector />} />
    <Route path="reset" element={<LoadableForgotPassword />} />
    <Route path="profile" element={<LoadableUserProfile />} />
    <Route path="notifications" element={<LoadableNotifications />} />
    <Route path="settings" element={<LoadableSettings />} />
    <Route path="project/:project/collaborate" element={<LoadableCollaborationBoard />} />
  </Routes>
}

const mapDispatchToProps = {
  dispatchUserDetails,
  setLoggedIn
}

export default connect(null, mapDispatchToProps)(Authenticator);