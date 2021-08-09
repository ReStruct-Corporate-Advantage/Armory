import React from "react";
import {connect} from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import Loadable from "react-loadable"
import { PageLoader } from "./components";
import { dispatchUserDetails, setLoggedIn } from "./global-actions";
import Helper from "./utils/Helper";
import Network from "./utils/network";
import { API_CONFIG } from "./constants/api-config";

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
  const { dispatchUserDetails, history, match, setLoggedIn } = props;
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  setLoggedIn(isLoggedIn);
  if (!isLoggedIn) {
    history.push("/login");
  } else {
    Network.get(`https://${API_CONFIG.HOST.PROD}/api/user/current`)
      .then(res => dispatchUserDetails(res.body))
      .catch(e => console.log(e));
  }

  return <Switch>
    <Route exact path={match.path} component={LoadableDashboard} />
    <Route path={`${match.path}/manage`} component={LoadableAuthorizer} />
    <Route path={`${match.path}/project`} component={LoadableProjectCreator} />
    <Route path={`${match.path}/page`} component={LoadablePageCreator} />
    <Route path={`${match.path}/component`} component={LoadableComponentCreator} />
    <Route path={`${match.path}/component/view`} component={LoadableComponentSelector} />
    <Route path={`${match.path}/reset`} component={LoadableForgotPassword} />
    <Route path={`${match.path}/profile`} component={LoadableUserProfile} />
    <Route path={`${match.path}/notifications`} component={LoadableNotifications} />
    <Route path={`${match.path}/settings`} component={LoadableSettings} />
    <Route path={`${match.path}/project/:project/collaborate`} component={LoadableCollaborationBoard} />
  </Switch>
}

const mapDispatchToProps = {
  dispatchUserDetails,
  setLoggedIn
}

export default connect(null, mapDispatchToProps)(withRouter(Authenticator))