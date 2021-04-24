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
          verticalPosition = bottomOut ? 0 : iconSize,
          horizontalPosition = rightOut ? iconSize : 0;
    return {[verticalPositioner]: verticalPosition, [horizontalPositioner]: horizontalPosition}
  }
  return (
    <CSSTransition in={true} timeout={500} classNames="fade" appear>
      <div className="c-RichTooltip position-absolute" ref={tipRef} style={tooltipPosition}>
        In Component RichTooltip
      </div>
    </CSSTransition>
  );
};

RichTooltip.propTypes = {
  iconSize: PropTypes.string
};

export default RichTooltip;