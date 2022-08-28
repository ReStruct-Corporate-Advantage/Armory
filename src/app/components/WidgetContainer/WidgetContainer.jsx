import React, { useState } from "react";
import PropTypes from "prop-types";
import { MenuBar } from "..";
import * as components from "..";
import "./WidgetContainer.component.scss";

const WidgetContainer = props => {
  const [accExpanded, setAccExpanded] = useState(true);

  const {childItems, clientRect, componentConfig, context, isDevMode, persistent, position, selectedComponent, styles, widgetDragging} = props;
  let [expanded, setExpanded] = useState(true);
  expanded = expanded && (persistent ? true : isDevMode);
  const asideComponents = childItems && childItems.map((child, key) => {
    const Component = components[child.name];
    return <Component expanded={expanded} key={key} selectedComponent={selectedComponent} {...child.props} componentsConfig={componentConfig}
      context={context} clientRect={clientRect} />
  }).filter(child => child);
  
  return (
    <div
      id="i-WidgetContainer"
      className="c-WidgetContainer position-absolute">
      <div id="i-WidgetContainer__accordion-handle" className="c-WidgetContainer__accordion-handle" 
        onClick={() => !widgetDragging && setAccExpanded(!accExpanded)}/>
      <div className={`c-WidgetContainer__body overflow-auto${accExpanded ? " expanded" : ""}`}>
        {asideComponents}
      </div>
    </div>
  );
};

WidgetContainer.propTypes = {

};

export default WidgetContainer;