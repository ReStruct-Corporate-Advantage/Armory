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
  const [currentVisible, setCurrentVisible] = useState();
  const animatableElements = {"LoginHero": 0, "TilesContainer-1": 1, "TilesContainer-2": 2, "FAQ": 3};

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
    <div className="c-Login flex-grow-1 m-2 m-sm-4">
      <main className="c-Login__content container h-100">
        <LoginHero containerClasses="col-12 pe-0" content={HERO_CONTENT}
          animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements.LoginHero <= animatableElements[currentVisible]}
          visibleClasses={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements[currentVisible] >= 0 ? "animate-before" + (animatableElements[currentVisible] > 0 ? " animate-after" : "") : ""}
          setCurrentVisible={setCurrentVisible} />
        {/* <LoginForm
          containerClasses="col-12 col-sm-3"
          style={{ marginTop: "5.5rem", height: "25rem" }}
        /> */}
        <TilesContainer
          animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements["TilesContainer-1"] <= animatableElements[currentVisible]}
          visibleClasses={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements[currentVisible] >= 1 ? ` animate-before${animatableElements[currentVisible] > 1 ? " animate-after" : ""}` : ""}
          containerClasses="welcome-tiles position-relative col-12"
          content={WELCOME_TILE_CONTENT}
          name="TilesContainer-1"
          setCurrentVisible={setCurrentVisible}
        />
        <TilesContainer
          animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements["TilesContainer-2"] < animatableElements[currentVisible]}
          containerClasses="solution-tiles col-12 px-0 py-0 py-sm-3 ps-sm-5 justify-content-around border-left-radius"
          content={SOLUTION_TILE_CONTENT}
          name="TilesContainer-2"
          setCurrentVisible={setCurrentVisible}
        />
        <Faq
          animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements.FAQ < animatableElements[currentVisible]}
          containerClasses="row"
          setCurrentVisible={setCurrentVisible}
        />
      </main>
    </div>
  );
};

Login.propTypes = {
  dispatchDeviceType: PropTypes.func,
};

const mapDispatchToProps = {
  dispatchDeviceType,
};

export default connect(null, mapDispatchToProps)(Login);
