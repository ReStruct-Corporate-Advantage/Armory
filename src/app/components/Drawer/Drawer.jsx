import React, {useState} from "react";
import PropTypes from "prop-types";
import LoadableIcon from "../LoadableIcon";
import * as components from ".."
import { DRAWER_TYPE } from "../../constants/types";
import "./Drawer.component.scss";

const Drawer = (props) => {
  const { config, state, setState, type } = props;
  const [hovered, setHovered] = useState();
  const { collapsed } = state;
  const { classes, collapseWidth, expandWidth } = config;

  let content;

  switch (type) {
    case DRAWER_TYPE.APP_DRAWER:
      content = <div className="d-flex flex-column">{
          config && config.menuItems.map(item => {
            const Component = components[item.type];
            return <Component />
          })
        }
      </div>;
  }
  return (
    <div
      className={`c-Drawer h-100 position-relative${
        classes ? " " + classes : ""
      }${state.collapsed ? "" : " expanded"}`}
      style={{ width: collapsed ? collapseWidth : expandWidth }}
    >
      <span
        className={`c-Drawer__controller position-absolute${hovered ? " hovered" : ""}`}
        onClick={() => setState({ collapsed: !state.collapsed })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <LoadableIcon
          key={"drawer-io-ioArrowForward"}
          size="1.5rem"
          color={hovered ? "#fff" : "#e83e8c"}
          icon="io.IoIosArrowForward"
          className="svg-stroke-theme"
        />
      </span>
      {content}
    </div>
  );
};

Drawer.propTypes = {
  config: PropTypes.object,
};

export default Drawer;
