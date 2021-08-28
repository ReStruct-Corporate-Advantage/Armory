import React, { useState } from "react";
import PropTypes from "prop-types";
import * as components from "./../";
import "./Aside.component.scss";

const Aside = props => {
  const {childItems, clientRect, position, selectedComponent, styles} = props;
  const [expanded, setExpanded] = useState(true);
  const asideComponents = childItems && childItems.map((child, key) => {
    const Component = components[child.name];
    return <Component key={key} selectedComponent={selectedComponent} {...child.props} clientRect={clientRect} />
  }).filter(child => child);
  
  return (
    <aside className={`c-Aside p-2 h-100${expanded ? " expanded" : ""}`} style={styles ? styles : null}>
      <span className={`handle ${position}${expanded ? " expanded" : ""}`} onClick={() => setExpanded(!expanded)} />
      <div className="c-Widgets h-100">
        {asideComponents}
      </div>
    </aside>
  );
};

Aside.propTypes = {
  childItems: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  clientRect: PropTypes.object,
  position: PropTypes.string,
  styles: PropTypes.object
};

export default Aside;