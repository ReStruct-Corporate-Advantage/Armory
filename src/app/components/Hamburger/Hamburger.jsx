import React, { useState } from "react";
import PropTypes from "prop-types";
import "./Hamburger.component.scss";

const Hamburger = props => {
  const {classes} = props;
  const [expanded, setExpanded] = useState();
  return <button type="button" className={`c-Hamburger p-1${classes ? " " + classes : ""}${expanded ? " open" : ""}`}
        onClick={() => setExpanded(!expanded)}>
        <div className="c-Hamburger__toggle-bar" />
        <div className="c-Hamburger__toggle-bar" />
        <div className="c-Hamburger__toggle-bar" />
      </button>
};

Hamburger.propTypes = {
  classes: PropTypes.string
};

export default Hamburger;