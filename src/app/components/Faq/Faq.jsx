import React from "react";
import PropTypes from "prop-types";
import "./Faq.component.scss";

const Faq = props => {
  const {containerClasses} = props;
  return (
    <div className={`c-Faq${containerClasses ? " " + containerClasses : ""}`}>
      In Component Faq
    </div>
  );
};

Faq.propTypes = {

};

export default Faq;