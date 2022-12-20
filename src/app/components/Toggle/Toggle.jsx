import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {dispatchToggles, dispatchNotification} from "../../global-actions";
import useTraceUpdate from "../../hooks/useTraceUpdate";
import LoadableIcon from "../LoadableIcon";
import "./Toggle.component.scss";

const Toggle = props => {
  const {index, toggle, toggles} = props;
  useTraceUpdate(props, "Toggle");
  // console.log("Rendering... ", toggle.name);
  const dispatch = useDispatch();
  return <li className="c-Toggle" key={index} style={{borderBottom: "1px solid #aaa", padding: "0.6rem 1rem 0.6rem"}} onClick={() => {
          const togglesClone = [...toggles];
          const clickedToggle = toggles.find(toggleInner => toggle.name === toggleInner.name);
          clickedToggle.selected = !clickedToggle.selected
          dispatch(dispatchToggles(togglesClone));
          dispatch(dispatchNotification({notification: `Toggle ${clickedToggle.displayName} ${clickedToggle.selected ? "activated!" : "deactivated!"}`, type: "success", show: true}))
        }}>
        <span>{toggle.displayName}</span>
        {toggle.icon
          && <span style={{float: "right"}}>
            {toggle.selected || toggle.generic
              ? <LoadableIcon key={"Toggle-" + index + "-" + toggle.icon.replace(".", "-")} size="1.5rem" color={toggle.color || "#e83e8c"} icon={toggle.icon} className="svg-stroke-theme" />
              : <LoadableIcon key={"Toggle-" + index + "-" + toggle.icon.replace(".", "-")} size="1.5rem" color={toggle.color || "#e83e8c"} icon={toggle.iconOff} className="svg-stroke-theme" />}
            </span>}
      </li>;
};

Toggle.propTypes = {
  key: PropTypes.string,
  toggle: PropTypes.object,
  toggleStore: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  data: PropTypes.array
};

export default Toggle;