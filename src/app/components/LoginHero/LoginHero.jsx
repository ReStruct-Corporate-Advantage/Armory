import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { AnimateOnScroll } from "../../HOC";
import JSXGenerator from "../../utils/CodeUtils/JSXGenerator";
import "./LoginHero.component.scss";

const LoginHero = props => {
  const { animateBorder, containerClasses, content, refs, setCurrentVisible, visibleClasses } = props;
  const navigate = useNavigate();
  const renderFunc = animationClass => <div className={`c-LoginHero position-relative
    ${containerClasses ? " " + containerClasses : ""}
    ${animationClass ? " " + animationClass : ""}`}>
    {refs ? JSXGenerator.generate(content, {navigate}, refs.current) : JSXGenerator.generate(content, {navigate})}
  </div>;
  return <AnimateOnScroll
    animateBorder={animateBorder}
    classes="row"
    visibleClasses={visibleClasses}
    setCurrentVisible={setCurrentVisible}
    name="LoginHero"
    reappear
  >
    {renderFunc}
  </AnimateOnScroll>;
};

LoginHero.propTypes = {
  containerClasses: PropTypes.string,
  content: PropTypes.object
};

export default LoginHero;