import React, {useState} from "react";
import PropTypes from "prop-types";
import {ToolsLeft, ToolsRight} from "./../";
import Helper from "./../../utils/Helper";
import "./ToolBox.component.scss";

const ToolBox = props => {
  const {toolsConfig: {classes, leftSnapped, size, tools}} = props
  const [expanded, setExpanded] = useState(false);
  // const leftSnappedTool = tools && tools.find(tool => tool.placement === "left" && tool.order === 0);
  
  const leftPlacedTools = tools && tools
    .filter(tool => !tool.placement || tool.placement === "left");
  const leftContainedTools = leftPlacedTools
    .filter(tool => tool.visibility === "contained")
    .sort((tool1, tool2) => tool1.order - tool2.order);
  const leftVisibleTools = leftPlacedTools
    .filter(tool => tool.visibility === "visible")
    .sort((tool1, tool2) => tool1.order - tool2.order);
  const leftTools = Helper.merge(leftVisibleTools, leftContainedTools);

  const rightPlacedTools = tools && tools
    .filter(tool => tool.placement === "right");
  const rightContainedTools = rightPlacedTools
    .filter(tool => tool.visibility === "contained")
    .sort((tool1, tool2) => tool1.order - tool2.order);
  const rightVisibleTools = rightPlacedTools
    .filter(tool => tool.visibility === "visible")
    .sort((tool1, tool2) => tool1.order - tool2.order);
  const rightTools = Helper.merge(rightVisibleTools, rightContainedTools);

  return (
    <div className={`c-ToolBox c-ToolBox__controlPanel d-inline-flex position-relative${classes ? " " + classes : ""}${leftSnapped ? " pl-0" : ""}`}
      onMouseLeave={() => setExpanded(false)}
      onMouseEnter={() => setExpanded(true)}>
      <ToolsLeft classes="d-inline-block" size={size} tools={leftTools} />
      <ToolsRight classes="ml-auto d-inline-block" size={size} tools={rightTools} expanded={expanded} />
      {rightContainedTools.length > 0 && <span className="c-ToolBox__toolDisplayer position-absolute">&lt;</span>}
    </div>
  );
};

ToolBox.propTypes = {
  toolsConfig: PropTypes.object
};

export default ToolBox;