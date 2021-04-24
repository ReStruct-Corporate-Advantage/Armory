import React from "react";
import PropTypes from "prop-types";
import {ToolWrapper} from "./../";
import "./ToolsLeft.component.scss";

const ToolsLeft = props => {
  const {classes, size, tools} = props;
  return (
    <div className={`c-ToolsLeft${classes ? " " + classes : ""}`}>
      {tools && tools.map((tool, key) => <ToolWrapper key={key} size={size} {...tool} />)}
    </div>
  );
};

ToolsLeft.propTypes = {
  classes: PropTypes.string,
  size: PropTypes.string,
  tools: PropTypes.array
};

export default ToolsLeft;