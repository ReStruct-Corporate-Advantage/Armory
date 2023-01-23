import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Navigate} from "react-router-dom";
import {dispatchDeviceType} from "../../global-actions";
import {LoginForm} from "../../components";
import Helper from "../../utils/Helper";
import "./Login.module.scss";

const Login = props => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    dispatchDeviceType({isMobile: Helper.isMobile()});
    const sessionCookie = Helper.getCookie("auth_session_token");
    setIsLoggedIn(!!sessionCookie);
  }, [isLoggedIn])

  if (isLoggedIn) {
    const username = Helper.getCookie("auth_session_user");
    if (username) {
      return <Navigate to={`/${username}`} replace={true} />;
    }
  }

  return (
    <div className="c-Login h-100 overflow-auto flex-grow-1">
      <main className="c-Login__content w-100">
        {/* <LoginHero /> */}
        <LoginForm />
      </main>
    </div>
  );
};

Login.propTypes = {
  dispatchDeviceType: PropTypes.func
};

const mapDispatchToProps = {
  dispatchDeviceType
}

export default connect(null, mapDispatchToProps)(Login);