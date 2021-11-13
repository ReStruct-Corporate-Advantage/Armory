import React from "react";
import {connect} from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import Loadable from "react-loadable"
import {createPropsSelector} from "reselect-immutable-helpers";
import { PageLoader } from "./components";
import { dispatchUserDetails } from "./global-actions";
import { getUserDetails } from "./global-selectors";
import Helper from "./utils/Helper";
import { ROLES } from "./constants/types";

const LoadableComponentImporter = Loadable({
    loader: () => import("./pages/ComponentImporter"),
    loading: PageLoader
})

const LoadableAdminComponentManager = Loadable({
    loader: () => import("./pages/AdminComponentManager"),
    loading: PageLoader
})

function Authorizer(props) {
  const { history, match, userDetails } = props;
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  const isAuthorized = userDetails && userDetails.role && userDetails.role === ROLES.ADMIN;
  if (!isLoggedIn) {
    history.push("/login");
  } else {
      if (!isAuthorized) {
        userDetails && history.push(`/${userDetails.username}`)
      }
  }

  return <Switch>
    <Route exact path={match.path} component={LoadableComponentImporter} />
    <Route exact path={`${match.path}/component`} component={LoadableComponentImporter} />
    <Route path={`${match.path}/component/add`} component={LoadableComponentImporter} />
    <Route path={`${match.path}/component/update`} component={LoadableAdminComponentManager} />
    <Route path={`${match.path}/page`} component={LoadableComponentImporter} />
    <Route path={`${match.path}/project`} component={LoadableComponentImporter} />
  </Switch>
}

const mapStateToProps = createPropsSelector({
    userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchUserDetails
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Authorizer))