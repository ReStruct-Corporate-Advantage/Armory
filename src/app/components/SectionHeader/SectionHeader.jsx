import React from "react";
import "./SectionHeader.component.scss";

const SectionHeader = props => <div className="c-SectionHeader">{props.title ? props.title : "Component Details"}</div>;

SectionHeader.propTypes = {

};

export default SectionHeader;