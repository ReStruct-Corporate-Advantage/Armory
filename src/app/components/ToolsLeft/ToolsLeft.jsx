import React from "react";
import PropTypes from "prop-types";
import {ToolWrapper} from "./../";
import "./ToolsLeft.component.scss";

const ToolsLeft = props => {
  const {classes, handlers, size, tools} = props;
  return (
    <div className={`c-ToolsLeft${classes ? " " + classes : ""}`}>
      {tools && tools.map((tool, key) => {
        const handler = handlers && handlers.find(handler => handler.name === tool.name)
        return <ToolWrapper handler={handler} key={key} {...tool} size={size} />
      })}
    </div>
  );
};

ToolsLeft.propTypes = {
  classes: PropTypes.string,
  size: PropTypes.string,
  tools: PropTypes.array
};

export default ToolsLeft;