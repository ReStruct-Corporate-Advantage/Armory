import React, { useState } from "react";
import PropTypes from "prop-types";
import * as $ from "jquery";
// import PositionAware from "./../../HOC/PositionAware";
import * as components from "./../";
import "./Aside.component.scss";

const Aside = props => {
  const [expanded, setExpanded] = useState(true);
  const asideComponents = props.childItems && props.childItems.map(child => {
    const Component = components[child.name];
    return <Component {...child.props} />
  }).filter(child => child);
  
  return (
    <aside className={`c-Aside p-2 h-100${expanded ? " expanded" : ""}`} style={props.styles ? props.styles : null}>
      <span className={`handle ${props.position}${expanded ? " expanded" : ""}`} onClick={() => setExpanded(!expanded)} />
      <div className="c-Widgets h-100">
        {asideComponents}
      </div>
    </aside>
  );
};

Aside.propTypes = {
  childItems: PropTypes.object,
  position: PropTypes.string
};

export default Aside;