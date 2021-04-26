import React, {memo, useState} from "react";
import PropTypes from "prop-types";
import {IconContext} from "react-icons";
import useTool from "./../../hooks/useTool";
import {RichTooltip, ToolActionContainer} from "./../";
import * as reactIcons from "react-icons/all";
import "./ToolWrapper.component.scss";

const ToolWrapper = memo(props => {
  const {btnClasses, btnText, data, disabled, expanded, hoverClasses, icon, layoutClasses, leftSnapped, name, size, toggleIcon, visibility} = props;
  const [hovered, setHovered] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(icon)
  const {jsx, type} = useTool(name && name.toLowerCase())
  const iconDescriptor = currentIcon && currentIcon.split(".");
  const Icon = reactIcons[iconDescriptor[1]];
  const iconSize = !expanded && visibility === "contained" ? "0" : size ? size : "1.1rem";
  return (
    <IconContext.Provider value={{ color: !disabled && (hovered || buttonClicked) ? "#FFCA28" : "", size, className: "global-class-name" }}>
      <div className={`c-ToolWrapper position-relative d-inline-block h-100
          ${!expanded && visibility === "contained" ? " hide" : ""}
          ${layoutClasses ? " " + layoutClasses : ""}
          ${hoverClasses ? " " + hoverClasses : ""}`}>
        <div className="h-100" onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(e) => {
            setCurrentIcon(currentIcon === icon && toggleIcon ? toggleIcon : icon)
            setButtonClicked(!buttonClicked)
          }}>
          <button
            className={`h-100
              ${btnClasses ? " " + btnClasses : ""}
              ${!disabled && (hovered || buttonClicked) ? " hovered" : ""}
              ${leftSnapped ? " snappedButton" : ""}
              ${!expanded && visibility === "contained" ? " hide" : ""}
              ${disabled ? " disabled" : ""}`}
            >
              {Icon ? <Icon className={hovered ? "hovered" : ""} /> : btnText}
          </button>
          {hoverClasses && <span className={`button-text${hovered || buttonClicked ? " px-2 font-size-12 h-100 " : ""}`}>{name}</span>}
        </div>
        {hovered && !buttonClicked && <RichTooltip iconSize={iconSize} />}
        {buttonClicked && jsx ? <ToolActionContainer type={type}>{jsx(data)}</ToolActionContainer>: null}
      </div>
    </IconContext.Provider>
  );
});

ToolWrapper.propTypes = {
  btnClasses: PropTypes.string,
  btnText: PropTypes.string,
  disabled: PropTypes.bool,
  expanded: PropTypes.bool,
  icon: PropTypes.string,
  leftSnapped: PropTypes.bool,
  toggleIcon: PropTypes.string,
  visibility: PropTypes.string
};

export default ToolWrapper;