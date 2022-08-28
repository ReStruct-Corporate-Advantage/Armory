import React, { useState } from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { getLevels } from "../../global-selectors";
import "./BreadCrumb.component.scss";

const BreadCrumb = props => {
  const {levels} = props;
  // const [levels, setLevels] = useState({username: {name: "mohiit1502", type: "Expandable"}, section: {name: "Components"}, item: {name: "Container-mohiit1502", type: "Expandable"}});
  const [hovered, setHovered] = useState({});
  
  return (
    <ul className={`c-BreadCrumb px-3${levels ? " mb-1 py-2" : " mb-0"}`}>
      {levels && Object.keys(levels).map(key => {
        const level = levels[key];
        return <li className={`${hovered[key] ? " hovered" : ""}`} onMouseOver={() => setHovered({[key]: true})} onMouseLeave={() => setHovered({[key]: false})}>
            <span>{level.name}</span>
          </li>
      })}
    </ul>
  );
};

BreadCrumb.propTypes = {
  levels: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  levels: getLevels
})

export default connect(mapStateToProps)(BreadCrumb);