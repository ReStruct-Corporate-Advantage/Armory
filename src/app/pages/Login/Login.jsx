import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { dispatchDeviceType } from "../../global-actions";
import { Faq, LoginForm, LoginHero, TilesContainer } from "../../components";
import Helper from "../../utils/Helper";
import { WELCOME_TILE_CONTENT, SOLUTION_TILE_CONTENT, HERO_CONTENT, FAQ_CONTENT } from "../../static/content";
import "./Login.module.scss";

const Login = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    dispatchDeviceType({ isMobile: Helper.isMobile() });
    const sessionCookie = Helper.getCookie("auth_session_token");
    setIsLoggedIn(!!sessionCookie);
  }, [isLoggedIn]);

  if (isLoggedIn) {
    const username = Helper.getCookie("auth_session_user");
    if (username) {
      return <Navigate to={`/${username}`} replace={true} />;
    }
  }

  return (
    <main className="c-Login flex-grow-1">
      <LoginForm />
    </main>
  );
};

Login.propTypes = {
  dispatchDeviceType: PropTypes.func,
};

const mapDispatchToProps = {
  dispatchDeviceType,
};

export default connect(null, mapDispatchToProps)(Login);
