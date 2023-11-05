import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import { PageLoader } from "./components";
import { dispatchUserDetails, setLoggedIn, toggleLoader } from "./global-actions";
import {getUserDetails} from "./global-selectors";
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
  LoadableComponentSelector,
  LoadableUserProfile,
  LoadableNotifications,
  LoadableSettings,
  LoadableCollaborationBoard
};

const Authenticator = props => {
  const { dispatchUserDetails, drawerWidth, navigate, setLoggedIn, toggleLoader, userDetails } = props;
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  const authSessionUser = Helper.getCookie("auth_session_user");
  const location = useLocation();
  const [rawData, setRawData] = useState();

  useEffect(() => {
    setLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      !userDetails && Network.get(ENDPOINTS.BE.USER.CURRENT, null, {toggleLoader})
        .then(res => dispatchUserDetails(res.body))
        .catch(e => console.log(e));
      window.location.pathname === "/" && navigate("/" + authSessionUser);
    }
  }, [isLoggedIn, location]);

  const getRoutes = () => {
    return <Routes>
        {
          AUTHENTICATED_CHILDREN.map((route, i) => {
            const Component = loadables[route.element];
            return <Route key={"authenticator-route-" + i} path={route.path}
              element={<Component drawerWidth={drawerWidth} navigate={navigate} rawData={rawData} setRawData={setRawData} />} />
          })
        }
      </Routes>;
  }

  return getRoutes();
}

Authenticator.props = {
  userDetails: PropTypes.object,
  dispatchUserDetails: PropTypes.func,
  setLoggedIn: PropTypes.func
}

const mapStateToProps = createPropsSelector({
  userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchUserDetails,
  setLoggedIn,
  toggleLoader
}

export default connect(mapStateToProps, mapDispatchToProps)(Authenticator);