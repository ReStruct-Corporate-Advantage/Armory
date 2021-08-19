import React from "react";
import PropTypes from "prop-types";
import {ToolWrapper} from "./../";
import "./ToolsRight.component.scss";

const ToolsRight = props => {
  const {classes, expanded, handlers, selectedComponent, size, tools} = props;
  return (
    <div className={`c-ToolsRight${classes ? " " + classes : ""}`}>
      {tools && tools.map((tool, key) => {
        const handler = handlers && handlers.find(handler => handler.name === tool.name)
        return <ToolWrapper handler={handler} key={key} selectedComponent={selectedComponent} {...tool} size={size} expanded={expanded} />
      })}
    </div>
  );
};

ToolsRight.propTypes = {
  classes: PropTypes.string,
  expanded: PropTypes.bool,
  selectedComponent: PropTypes.string,
  size: PropTypes.string,
  tools: PropTypes.array
};

export default ToolsRight;