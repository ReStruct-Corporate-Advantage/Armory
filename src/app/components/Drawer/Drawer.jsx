import React, {createRef, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../global-selectors";
import LoadableIcon from "../LoadableIcon";
import * as components from ".."
import EVENTS from "../../utils/eventHandlers";
import { DRAWER_TYPE } from "../../constants/types";
import "./Drawer.component.scss";

const Drawer = (props) => {
  const { config, state, setState, type, user } = props;
  const [hovered, setHovered] = useState();
  const [selected, setSelected] = useState();
  const [top, setTop] = useState();
  const parentRef = useRef();
  const menuRefs = useRef({});
  const navigate = useNavigate();
  const { collapsed } = state;
  const { classes, collapseWidth, expandWidth } = config;
  let content;

  useEffect(() => {
    if (!selected && menuRefs.current) {
      setSelected(menuRefs.current["dashboard"]);
    }
  }, [menuRefs])

  useEffect(() => {
    const selectedCoOrds = selected && selected.current && selected.current.getBoundingClientRect();
    const parentCoOrds = parentRef && parentRef.current && parentRef.current.getBoundingClientRect();
    const top = parentCoOrds && selectedCoOrds && (selectedCoOrds.top - parentCoOrds.top);
    top && setTop(top);
  }, [selected])

  switch (type) {
    case DRAWER_TYPE.APP_DRAWER:
      content = <div className="d-flex flex-column h-100">{
          config && config.menuItems.map((item, i) => {
            const Component = components[item.type];
            if (collapsed) {
              if (item.collapseSize) {
                item.props.height = item.collapseSize;
                item.props.width = item.collapseSize;
              }
            } else {
              if (item.expandSize) {
                item.props.height = item.height || item.expandSize;
                item.props.width = item.expandSize;
              };
            }
            if (item.action && item.actionArgs) {
              if (item.needsNavigate) {
                item.actionArgs.navigate = navigate;
              }
            }
            let menuRef = menuRefs.current[item.id];
            if (!menuRef) {
              menuRef = createRef();
              menuRefs.current[item.id] = menuRef;
            }
            switch (item.type) {
              case "LoadableIcon":
                return <div key={"drawer-" + i} className={`c-Drawer__menu-item d-flex align-items-center position-relative
                    ${item.id}
                    ${item.containerClasses ? " " + item.containerClasses : ""}
                    ${collapsed ? item.collapseClasses ? " " + item.collapseClasses : "" : item.expandClasses ? " " + item.expandClasses : ""}
                    ${selected === menuRef ? " selected" : ""}`}
                    ref={menuRef}
                    onClick={() => {
                      setSelected(menuRef);
                      EVENTS.genericDrawerMenuClickHandler(item, user);
                    }}
                  >
                  <Component {...item.props} {...state} />
                  <span className={`c-Drawer__menu-item-label fw-bold overflow-hidden z-index-3`}>{item.label}</span>
                </div>;
              case "UserImage":
                return <Component ref={menuRef} key={"drawer-" + i} containerClasses={item.containerClasses + " " + item.id} {...item} {...state} {...item.props} />;
              default:
                return <div key={"drawer-" + i} className={`c-Drawer__menu-item d-flex align-items-center position-relative
                    ${item.id}
                    ${item.containerClasses ? " " + item.containerClasses : ""}
                    ${collapsed ? item.collapseClasses ? " " + item.collapseClasses : "" : item.expandClasses ? " " + item.expandClasses : ""}`}
                    ref={menuRef}
                  >
                  <LoadableIcon {...item.props} {...state} />
                </div>
            }
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
      ref={parentRef}
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
      <div className="c-Drawer__content h-100 overflow-hidden position-relative">
        {content}
        <div className="c-Drawer__menu-item__background-container position-absolute w-100" style={{top: top - (4.5 * 14)}}>
          <span className="c-Drawer__menu-item__background pre l-1 z-index-1" />
          <span className="c-Drawer__menu-item__background pre l-2 z-index-2" />
          <span className="c-Drawer__menu-item__background post l-1 z-index-1" />
          <span className="c-Drawer__menu-item__background post l-2 z-index-2" />
          <span className="c-Drawer__menu-item__background mid bg-white z-index-1" />
        </div>
      </div>
    </div>
  );
};

Drawer.propTypes = {
  config: PropTypes.object,
  user: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  user: getUserDetails
})

export default connect(mapStateToProps)(Drawer);
