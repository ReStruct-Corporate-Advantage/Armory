import React, { useState } from "react";
import PropTypes from "prop-types";
import * as components from "..";
import "./Aside.component.scss";

const Aside = (props) => {
  const {
    asideClasses,
    childItems,
    clientRect,
    componentConfig,
    context,
    dropLocation,
    isDevMode,
    persistent,
    position,
    selectedComponent,
    styles,
  } = props;
  let [expanded, setExpanded] = useState(true);
  expanded = expanded && (persistent ? true : isDevMode);
  const asideComponents =
    childItems &&
    childItems
      .map((child, key) => {
        const Component = components[child.name];
        return (
          <Component
            parentExpanded={expanded}
            key={key}
            selectedComponent={selectedComponent}
            {...child.props}
            componentsConfig={componentConfig}
            context={context}
            clientRect={clientRect}
          />
        );
      })
      .filter((child) => child);

  return (
    <aside
      className={`c-Aside h-100${expanded ? " expanded" : ""}${asideClasses ? " " + asideClasses : ""}`}
      style={styles ? styles : null}
    >
      <span
        className={`handle ${position}${expanded ? " expanded" : ""}`}
        onClick={() => setExpanded(!expanded)}
      />
      <div className="c-Widgets h-100">{asideComponents}</div>
    </aside>
  );
};

Aside.propTypes = {
  asideClasses: PropTypes.string,
  childItems: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  clientRect: PropTypes.object,
  componentConfig: PropTypes.object,
  context: PropTypes.string,
  dropLocation: PropTypes.array,
  isDevMode: PropTypes.bool,
  persistent: PropTypes.bool,
  position: PropTypes.string,
  selectedComponent: PropTypes.string,
  styles: PropTypes.object,
};

export default Aside;
