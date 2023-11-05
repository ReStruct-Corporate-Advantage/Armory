import React, {useState} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import { dispatchDeviceType } from "../../global-actions";
import { Faq, LoginHero, TilesContainer } from "../../components";
import { WELCOME_TILE_CONTENT, SOLUTION_TILE_CONTENT, HERO_CONTENT, FAQ_CONTENT } from "../../static/content";
import "./Landing.module.scss";

const Landing = () => {
  const [currentVisible, setCurrentVisible] = useState();
  const animatableElements = {"LoginHero": 0, "TilesContainer-1": 1, "TilesContainer-2": 2, "FAQ": 3};

  return (
    <div className="c-Landing flex-grow-1 m-2 m-sm-4 arm-pt-4">
      <main className="c-Landing__content container h-100">
        <LoginHero containerClasses="col-12 pe-0" content={HERO_CONTENT}
          animateBorder={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements.LoginHero <= animatableElements[currentVisible]}
          visibleClasses={currentVisible && animatableElements[currentVisible] !== undefined
            && animatableElements[currentVisible] >= 0 ? "animate-before" + (animatableElements[currentVisible] > 0 ? " animate-after" : "") : ""}
          setCurrentVisible={setCurrentVisible} />
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

Landing.propTypes = {
  dispatchDeviceType: PropTypes.func,
};

const mapDispatchToProps = {
  dispatchDeviceType
};

export default connect(null, mapDispatchToProps)(Landing);