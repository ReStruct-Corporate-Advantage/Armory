import React, {memo, useState} from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import "./CodeCollapsable.component.scss";

const CodeCollapsable = memo(props => {
  const {children, id, indent, name, dispatchSelectedComponent} = props;
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className={`c-CodeCollapsable${collapsed ? " collapsed" : ""}`} style={{marginLeft: `${indent * 0.5}rem`}} onClick={e => {
          dispatchSelectedComponent(id);
          e.stopPropagation();
        }}>
        <div className={`c-CodeCollapsable__clickHandler${collapsed ? " collapsed" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}>
          {hovered
          ? ((collapsed ? "Expand " : "Collapse ") + (name || "component"))
          : collapsed ? name || "component" : ""}
        </div>
        {children}
      </div>
    </CSSTransition>
  );
});

CodeCollapsable.propTypes = {
  indent: PropTypes.number,
  name: PropTypes.string,
  dispatchSelectedComponent: PropTypes.func
};

export default CodeCollapsable;