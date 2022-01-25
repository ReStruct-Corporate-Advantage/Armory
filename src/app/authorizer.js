import React from "react";
import {connect} from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import {createPropsSelector} from "reselect-immutable-helpers";
import {withRouter} from "./HOC/withRouter";
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
  const { userDetails } = props;
  const navigate = useNavigate();
  const isLoggedIn = !!Helper.getCookie("auth_session_token");
  const isAuthorized = userDetails && userDetails.role && userDetails.role === ROLES.ADMIN;
  if (!isLoggedIn) {
    navigate("login");
  } else {
      if (!isAuthorized) {
        userDetails && navigate(userDetails.username)
      }
  }

  return <Routes>
    <Route path="/" element={<LoadableComponentImporter />} />
    <Route path="component" element={<LoadableComponentImporter />} />
    <Route path="component/add" element={<LoadableComponentImporter />} />
    <Route path="component/update" element={<LoadableAdminComponentManager />} />
    <Route path="page" element={<LoadableComponentImporter />} />
    <Route path="project" element={<LoadableComponentImporter />} />
  </Routes>
}

const mapStateToProps = createPropsSelector({
    userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchUserDetails
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Authorizer))