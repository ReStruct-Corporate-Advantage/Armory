import React, {useState} from "react";
import PropTypes from "prop-types";
import {IconContext} from "react-icons";
import * as reactIcons from "react-icons/all";
import {RichTooltip} from "./../";
import "./ToolWrapper.component.scss";

const ToolWrapper = props => {
  const {btnClasses, btnText, disabled, expanded, icon, layoutClasses, leftSnapped, size, toggleIcon, visibility} = props;
  const [hovered, setHovered] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(icon)
  const iconDescriptor = currentIcon && currentIcon.split(".");
  const iconProvider = iconDescriptor[0];
  const Icon = reactIcons[iconDescriptor[1]];
  const iconSize = !expanded && visibility === "contained" ? "0" : size ? size : "1.1rem";
  return (
    <IconContext.Provider value={{ color: !disabled && (hovered || buttonClicked) ? "#FFCA28" : "", size, className: "global-class-name" }}>
      <div className={`c-ToolWrapper position-relative d-inline-block h-100${!expanded && visibility === "contained" ? " hide" : ""}${layoutClasses ? " " + layoutClasses : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
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
        {hovered && <RichTooltip iconSize={iconSize} />}
      </div>
    </IconContext.Provider>
  );
};

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