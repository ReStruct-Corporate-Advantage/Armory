import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {LoadableIcon} from "..";
import "./Widget.component.scss";
import EVENTS from "../../utils/eventHandlers";

const Widget = props => {
  const {actions, classes, header, content, user} = props;
  const navigate = useNavigate();
  const actionRenders = actions && actions.map(action => {
    const {color, icon, route, size} = action;
    return <button className="c-Widget__action-btn" onClick={() => EVENTS.genericNavigationClickHandler({
      action: "navigate",
      actionArgs: {route, navigate}
    }, user)}>
      <span className={`c-Widget__action-btn__text${icon ? " me-2" : ""}`}>CREATE</span>
      {icon && <LoadableIcon classes="cursor-pointer" icon={icon} size={size || "1rem"} color={color} />}
    </button>
  })
  return (
    <div className={`c-Widget w-100 h-100 position-relative${classes ? " " + classes : ""}`}>
      <div className="c-Widget__header w-100 px-3 py-1">
        <strong>{header || "Widget"}</strong>
        <span className="float-end">{actionRenders}</span>
      </div>
      <div className="c-Widget__content w-100">{content}</div>
    </div>
  );
};

Widget.propTypes = {
  classes: PropTypes.string,
  header: PropTypes.string,
  content: PropTypes.object
};

export default Widget;