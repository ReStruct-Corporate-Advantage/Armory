import React, {memo, useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {dispatchTooltip} from "../../global-actions";
import {dispatchToolAction} from "./../../pages/ComponentCreator/actions";
import useTool from "./../../hooks/useTool";
import {LoadableIcon, QuickOptionsContainer} from "./../";
import "./ToolWrapper.component.scss";

const ToolWrapper = memo(props => {
  const {btnClasses, btnText, componentSpecific, data, disabled, dispatchToolAction, dispatchTooltip, expanded, hoverClasses, icon, layoutClasses, leftSnapped, name, selectedComponent, size, toggleIcon, tooltip, visibility} = props;
  const [hovered, setHovered] = useState(false);
  const [expand, setExpand] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(componentSpecific ? {} : false);
  const [currentIcon, setCurrentIcon] = useState(icon)
  const [itemRect, setItemRect] = useState();
  const ref = useRef();
  const {onClickHandler, jsx, type} = useTool(name && name.toLowerCase(), props)
  const iconColor = !disabled && (hovered || (componentSpecific ? buttonClicked[selectedComponent] : buttonClicked)) ? "#FFCA28" : "#e83e8c";
  const iconClass = `global-class-name${hovered ? " hovered" : ""}`;

  useEffect(() => {
      setTimeout(() => setExpand(buttonClicked || hovered), 1000);
      ref.current && setItemRect(ref.current.getBoundingClientRect());
  }, [buttonClicked, hovered])

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    dispatchTooltip({show: hovered && !buttonClicked, prefer: "right", content: tooltip, itemRect})
  }, [buttonClicked, hovered])
  return (
    <div className={`c-ToolWrapper position-relative d-inline-block h-100
        ${!expanded && visibility === "contained" ? " hide" : ""}
        ${layoutClasses ? " " + layoutClasses : ""}
        ${hoverClasses ? " " + hoverClasses : ""}`}
        ref={ref}>
      <div className="h-100" data-toggle="modal" data-target="#tool-action-modal"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          setCurrentIcon(currentIcon === icon && toggleIcon ? toggleIcon : icon)
          setButtonClicked(componentSpecific ? {...buttonClicked, [selectedComponent]: !buttonClicked[selectedComponent]} : !buttonClicked)
          jsx && dispatchToolAction()
          onClickHandler && onClickHandler();
        }}>
        <button
          className={`h-100
            ${btnClasses ? " " + btnClasses : ""}
            ${!disabled && (hovered || (componentSpecific ? buttonClicked[selectedComponent] : buttonClicked)) ? " hovered" : ""}
            ${leftSnapped ? " snappedButton" : ""}
            ${!expanded && visibility === "contained" ? " hide" : ""}
            ${disabled ? " disabled" : ""}`}
          >
            {/* {Icon ? <Icon className={hovered ? "hovered" : ""} /> : btnText} */}
            {currentIcon ? <LoadableIcon icon={currentIcon} size={size} color={iconColor} class={`me-2${iconClass ? " " + iconClass : ""}`} /> : btnText}
        </button>
        {hoverClasses && <span className={`button-text${expand && (hovered || (componentSpecific ? buttonClicked[selectedComponent] : buttonClicked)) ? " px-2 font-size-12 h-100 " : ""}`}>{name}</span>}
      </div>
      {/* {hovered && !buttonClicked && <RichTooltip iconSize={size} content={tooltip} />} */}
      {(componentSpecific ? buttonClicked[selectedComponent] : buttonClicked) && jsx && type === "TAGGED" ? <QuickOptionsContainer data={data} show={componentSpecific ? buttonClicked[selectedComponent] : buttonClicked}>{jsx(data)}</QuickOptionsContainer>: null}
    </div>
  );
});

ToolWrapper.propTypes = {
  btnClasses: PropTypes.string,
  btnText: PropTypes.string,
  disabled: PropTypes.bool,
  dispatchToolAction: PropTypes.func,
  expanded: PropTypes.bool,
  handler: PropTypes.object,
  icon: PropTypes.string,
  leftSnapped: PropTypes.bool,
  selectedComponent: PropTypes.string,
  toggleIcon: PropTypes.string,
  visibility: PropTypes.string
};

const mapDispatchToProps = {
  dispatchToolAction,
  dispatchTooltip
}

export default connect(null, mapDispatchToProps)(ToolWrapper);