import React from "react";
import "./SectionHeader.component.scss";

const SectionHeader = props => <div className={`c-SectionHeader${props.className ? " " + props.className : ""}`}>{props.title ? props.title : "Component Details"}</div>;

SectionHeader.propTypes = {

};

export default SectionHeader;