import React, {useState, useEffect, useRef} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { dispatchDeviceType } from "../../global-actions";
import { Faq, LoginHero, Onboarder, TilesContainer } from "../../components";
import Helper from "../../utils/Helper";
import { DOMHelper } from "../../utils";
import { WELCOME_TILE_CONTENT, SOLUTION_TILE_CONTENT, HERO_CONTENT, FAQ_CONTENT } from "../../static/content";
import "./Join.module.scss";

const Join = props => {
  const {dispatchDeviceType} = props;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayOnboarder, setDisplayOnboarder] = useState();
  const [hideMain, setHideMain] = useState();
  const [currentVisible, setCurrentVisible] = useState();
  const [matrixRendered, setMatrixRendered] = useState();
  const onboarderRef = useRef();
  const refs = useRef({});
  const animatableElements = {"LoginHero": 0, "TilesContainer-1": 1, "TilesContainer-2": 2, "FAQ": 3};

  useEffect(() => {
    dispatchDeviceType({ isMobile: Helper.isMobile() });
    const sessionCookie = Helper.getCookie("auth_session_token");
    setIsLoggedIn(!!sessionCookie);
  }, [isLoggedIn]);
  
  useEffect(() => {
    const inputEl = refs.current && refs.current.LoginHeroInputField && refs.current.LoginHeroInputField.current;
    if (inputEl && onboarderRef.current) {
      const isMobile = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 576;
      const inputLocation = inputEl.getBoundingClientRect();
      const onboarderLocation = onboarderRef.current.getBoundingClientRect();
      inputEl.classList.remove("w-75");
      inputEl.style.position = "absolute";
      inputEl.style.zIndex = 1;
      if (!isMobile) {
        inputEl.style.transform = `translate(${onboarderLocation.x - inputLocation.x + 10.5}px, ${onboarderLocation.y - inputLocation.y + 21}px)`;
        inputEl.style.width = (onboarderLocation.right - onboarderLocation.left - 21) + "px";
      } else {
        inputEl.style.transform = `translate(${onboarderLocation.x - inputLocation.x + 63}px, ${onboarderLocation.y - inputLocation.y + 18}px)`;
        inputEl.style.width = (onboarderLocation.right - onboarderLocation.left - 36) + "px";
      }
    }
  }, [refs, onboarderRef]);

  useEffect(() => {
    setTimeout(() => setDisplayOnboarder(true), 300);
  }, []);

  useEffect(() => {
    displayOnboarder && setTimeout(() => setHideMain(true), 500);
  }, [displayOnboarder])

  useEffect(() => {
    if (hideMain) {
      DOMHelper.renderMatrix("matrix-canvas");
      setMatrixRendered(true);
    }
  }, [hideMain])

  if (isLoggedIn) {
    const username = Helper.getCookie("auth_session_user");
    if (username) {
      return <Navigate to={`/${username}`} replace={true} />;
    }
  }

  return (
    <div className={`c-Join h-100 overflow-auto position-relative flex-grow-1 arm-pt-4 d-flex flex-column align-items-center
      ${displayOnboarder ? " onboarder" : ""}`}>
      <canvas id="matrix-canvas" className={`c-Join__background position-absolute bg-black w-100 h-100${displayOnboarder ? " z-1" : " z-n1"}${matrixRendered ? "" : " opacity-0"}`} />
      <Onboarder classes={`w-100 max-tablet arm-mt-6 position-absolute${displayOnboarder ? " z-1" : " z-n1"}`} contentRef={onboarderRef} isVisible={hideMain} />
      {!hideMain &&
        <main className="c-Join__content container h-100">
          <LoginHero containerClasses="c-Join__hero col-12 pe-0" content={HERO_CONTENT}
            animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
              && animatableElements.LoginHero <= animatableElements[currentVisible]}
            visibleClasses={currentVisible && animatableElements[currentVisible] !== undefined
              && animatableElements[currentVisible] >= 0 ? "animate-before" + (animatableElements[currentVisible] > 0 ? " animate-after" : "") : ""}
            setCurrentVisible={setCurrentVisible}
            refs={refs} />
          {/* <LoginForm
            containerClasses="col-12 col-sm-3"
            style={{ marginTop: "5.5rem", height: "25rem" }}
          /> */}
          <TilesContainer
            animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
              && animatableElements["TilesContainer-1"] <= animatableElements[currentVisible]}
            visibleClasses={currentVisible && animatableElements[currentVisible] !== undefined
              && animatableElements[currentVisible] >= 1 ? ` animate-before${animatableElements[currentVisible] > 1 ? " animate-after" : ""}` : ""}
            containerClasses="c-Join__welcome-tiles position-relative col-12"
            content={WELCOME_TILE_CONTENT}
            name="TilesContainer-1"
            setCurrentVisible={setCurrentVisible}
          />
          <TilesContainer
            animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
              && animatableElements["TilesContainer-2"] < animatableElements[currentVisible]}
            containerClasses="c-Join__solution-tiles position-relative col-12 px-0 py-0 py-sm-3 ps-sm-5 justify-content-around border-left-radius"
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
      }
    </div>
  );
};


Join.propTypes = {
  dispatchDeviceType: PropTypes.func,
};

const mapDispatchToProps = {
  dispatchDeviceType,
};

export default connect(null, mapDispatchToProps)(Join);