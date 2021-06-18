import React, { useState } from "react";
import PropTypes from "prop-types";
import "./BreadCrumb.component.scss";

const BreadCrumb = props => {
  const [levels, setLevels] = useState({});
  return (
    <div className="c-BreadCrumb">
      In Component BreadCrumb
    </div>
  );
};

BreadCrumb.propTypes = {

};

export default BreadCrumb;