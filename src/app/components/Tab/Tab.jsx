import React from "react";
import PropTypes from "prop-types";
import "./Tab.component.scss";

const Tab = props => {
  const {label, index, value, onChange, width} = props;
  const selected = value === index;
  return (
    <div role="button" className={`c-Tab p-3 d-inline-block text-center${selected ? " selected" : ""}`}
      onClick={() => onChange(index)} onKeyPress={() => {}} style={{width: width + "%"}}>
      {label}
    </div>
  );
};

Tab.propTypes = {

};

export default Tab;