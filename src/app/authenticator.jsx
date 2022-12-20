import React, {useEffect} from "react";
import {connect} from "react-redux";
import { Route, Routes, useMatch, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import { PageLoader } from "./components";
import { dispatchUserDetails, setLoggedIn } from "./global-actions";
import Helper from "./utils/Helper";
import Network from "./utils/network";
import ENDPOINTS from "./constants/endpoints";
import {AUTHENTICATED_CHILDREN} from "./routes";

const LoadableDashboard = Loadable({
  loader: () => import("./pages/DashboardNew"),
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

const loadables = {
  LoadableDashboard,
  LoadableAuthorizer,
  LoadableProjectCreator,
  LoadablePageCreator,
  LoadableComponentCreator,
  LoadableComponentSelector ,
  LoadableForgotPassword,
  LoadableUserProfile,
  LoadableNotifications,
  LoadableSettings,
  LoadableCollaborationBoard
};

function Authenticator(props) {
  const { dispatchUserDetails, setLoggedIn } = props;
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  const authSessionUser = Helper.getCookie("auth_session_user");
  const navigate = useNavigate();
  if (isLoggedIn && window.location.pathname === "/" && authSessionUser) {
    navigate("/" + authSessionUser);
  }

  useEffect(() => {
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      Network.get(ENDPOINTS.BE.USER.CURRENT)
        .then(res => {
          // window.location.pathname === "/" && navigate("/" + res.body.username);
          dispatchUserDetails(res.body);
        })
        .catch(e => console.log(e));
    }
  }, [isLoggedIn]);

  const getRoutes = () => {
    return <Routes>
        {
          AUTHENTICATED_CHILDREN.map(route => {
            const Component = loadables[route.element];
            return <Route path={route.path} element={<Component />} />
          })
        }
      </Routes>;
  }

  return getRoutes();
}

const mapDispatchToProps = {
  dispatchUserDetails,
  setLoggedIn
}

export default connect(null, mapDispatchToProps)(Authenticator);