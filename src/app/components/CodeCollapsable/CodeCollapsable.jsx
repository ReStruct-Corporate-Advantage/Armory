import React, {memo, useState} from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import "./CodeCollapsable.component.scss";

const CodeCollapsable = memo(props => {
  const {children, id, indent, componentName, setSelectedComponent} = props;
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className={`c-CodeCollapsable${collapsed ? " collapsed" : ""}`} style={{marginLeft: `${indent * 0.5}rem`}} onClick={e => {
          setSelectedComponent(id);
          e.stopPropagation();
        }}>
        <div className={`c-CodeCollapsable__clickHandler${collapsed ? " collapsed" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          {hovered
          ? ((collapsed ? "Expand " : "Collapse ") + (componentName || "component"))
          : collapsed ? componentName || "component" : ""}
        </div>
        {children}
      </div>
    </CSSTransition>
  );
});

CodeCollapsable.propTypes = {
  indent: PropTypes.number,
  componentName: PropTypes.string,
  setSelectedComponent: PropTypes.func
};

export default CodeCollapsable;