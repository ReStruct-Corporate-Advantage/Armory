import React from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import "./ToolActionContainer.component.scss";

const ToolActionContainer = props => {
  const {children, type} = props;
  let containerClasses = "";
  switch (type) {
    case "TAGGED":
      containerClasses = " position-absolute tagged-container"
      break;
    case "MODAL":
      containerClasses = "modal";
      break;
  }
  return (
    <CSSTransition in={true} timeout={500} classNames="expand" appear>
      <div className={`c-ToolActionContainer${containerClasses}`} onClick={() => {}}>
        {children}
      </div>
    </CSSTransition>
  );
};

ToolActionContainer.propTypes = {
  type: PropTypes.string
};

export default ToolActionContainer;