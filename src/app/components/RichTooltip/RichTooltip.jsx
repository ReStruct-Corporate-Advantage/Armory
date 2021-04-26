import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import Helper from "./../../utils/Helper";
import "./RichTooltip.component.scss";

const RichTooltip = props => {
  const {iconSize} = props;
  const tipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({})

  useEffect(() => {
    const itemState = tipRef && tipRef.current && Helper.getItemStateInViewport(tipRef.current);
    setTooltipPosition(getTooltipPosition(itemState));
  }, [tipRef])

  const getTooltipPosition = (itemState) => {
    const {leftOut, rightOut, topOut, bottomOut} = itemState;
    const verticalPositioner = bottomOut ? "bottom" : "top",
          horizontalPositioner = rightOut ? "right" : "left",
          verticalPosition = bottomOut ? "-50%" : "150%",
          horizontalPosition = 0,
          marginLeft = rightOut ? "-10rem" : 0;
    const positionClass = bottomOut ? rightOut ? "left-top" : "right-top" : rightOut ? "left-bottom" : "right-bottom" 
    return {styles: {[verticalPositioner]: verticalPosition, [horizontalPositioner]: horizontalPosition, marginLeft}, positionClass};
  }
  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className={`c-RichTooltip position-absolute${tooltipPosition.positionClass ? " " + tooltipPosition.positionClass : ""}`} ref={tipRef} style={tooltipPosition.styles}>
        In Component RichTooltip
      </div>
    </CSSTransition>
  );
};

RichTooltip.propTypes = {
  iconSize: PropTypes.string
};

export default RichTooltip;