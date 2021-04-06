import React from "react";
import PropTypes from "prop-types";
import "./SectionHeader.component.scss";
import ToolBox from "../ToolBox";

const SectionHeader = props => {
  return (
    <div className="c-SectionHeader">
      <p className="c-SectionHeader__title">{props.title ? props.title : "Component Details"}</p>
      <ToolBox />
    </div>
  );
};

SectionHeader.propTypes = {

};

export default SectionHeader;