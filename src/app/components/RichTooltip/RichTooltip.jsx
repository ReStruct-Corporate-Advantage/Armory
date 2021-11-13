import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import Helper from "./../../utils/Helper";
import "./RichTooltip.component.scss";

const RichTooltip = props => {
  const {positionClasses: incomingPositionClasses, tooltip} = props;
  const tipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({})

  useEffect(() => {
    tipRef && tipRef.current && setTooltipPosition(Helper.getItemPosition(tipRef.current));
  }, [tipRef])

  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className={`c-RichTooltip position-absolute${tooltipPosition.positionClass ? " " + tooltipPosition.positionClass : ""}${incomingPositionClasses ? " " + incomingPositionClasses : ""}`}
        ref={tipRef} style={tooltipPosition.styles}>
        {tooltip || "In Component RichTooltip"}
      </div>
    </CSSTransition>
  );
};

RichTooltip.propTypes = {
  iconSize: PropTypes.string,
  positionClasses: PropTypes.string
};

export default RichTooltip;