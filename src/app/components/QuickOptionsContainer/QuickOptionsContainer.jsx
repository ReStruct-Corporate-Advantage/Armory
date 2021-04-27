import React from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import "./QuickOptionsContainer.component.scss";

const QuickOptionsContainer = props => {
  const {children, data} = props
  const containerClasses = "position-absolute tagged-container"
  
  return (
    <CSSTransition in={true} timeout={500} classNames="expand" appear>
      <div className={`c-QuickOptionsContainer ${containerClasses}`} onClick={() => {}}>
        {children}
      </div>
    </CSSTransition>
  );
};

QuickOptionsContainer.propTypes = {
  data: PropTypes.object
};

export default QuickOptionsContainer;