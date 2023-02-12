import React from "react";
import PropTypes from "prop-types";
import { AnimateOnScroll } from "../../HOC";
import JSXGenerator from "../../utils/CodeUtils/JSXGenerator";
import "./TilesContainer.component.scss";

const TilesContainer = (props) => {
  const {animateBorder, containerClasses, content, name, setCurrentVisible, visibleClasses} = props;
  const renderFunc = animationClass => <div className={`c-TilesContainer
    ${containerClasses ? " " + containerClasses : ""}
    ${animationClass ? " " + animationClass : ""}`}>
      {JSXGenerator.generate(content)}
    </div>;

  return <AnimateOnScroll
    animateBorder={animateBorder}
    classes="row"
    visibleClasses={visibleClasses}
    setCurrentVisible={setCurrentVisible}
    name={name}
    reappear
  >
    {renderFunc}
  </AnimateOnScroll>;
};

TilesContainer.propTypes = {
  containerClasses: PropTypes.string
};

export default TilesContainer;
