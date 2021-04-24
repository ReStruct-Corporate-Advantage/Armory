import React, {memo, useState} from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import "./CodeCollapsable.component.scss";

const CodeCollapsable = memo(props => {

  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className={`c-CodeCollapsable${collapsed ? " collapsed" : ""}`} style={{marginLeft: `${props.indent * 0.5}rem`}}>
        <div className={`c-CodeCollapsable__clickHandler${collapsed ? " collapsed" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          {hovered
          ? ((collapsed ? "Expand " : "Collapse ") + (props.componentName || "component"))
          : collapsed ? props.componentName || "component" : ""}
        </div>
        {props.children}
      </div>
    </CSSTransition>
  );
});

CodeCollapsable.propTypes = {
  indent: PropTypes.number,
  componentName: PropTypes.string
};

export default CodeCollapsable;