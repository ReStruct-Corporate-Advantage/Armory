import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {CSSTransition} from "react-transition-group";
import {getToggles, getTooltip} from "../../global-selectors";
import Helper from "./../../utils/Helper";
import "./RichTooltip.component.scss";

const RichTooltip = props => {
  const {toggles, tooltip} = props;
  const {show, prefer, content, itemRect} = tooltip;
  const tipRef = useRef(null);
  const [tooltipPosition, setTooltipPosition] = useState({})

  useEffect(() => {
    if (tipRef.current && itemRect) {
      console.log(itemRect);
      const positionAndMeta = Helper.getItemPosition(tipRef.current, itemRect, prefer);
      console.log(positionAndMeta);
      setTooltipPosition(positionAndMeta);
    }

  }, [prefer, tipRef, itemRect, show])

  const tooltips = toggles && toggles.find(toggle => toggle.name === "tooltips");
  return !tooltips || tooltips.selected ? <CSSTransition in={show} timeout={500} classNames="fade" appear>
      <div className="c-RichTooltip position-fixed" ref={tipRef} style={tooltipPosition.styles}>
        {content || "Details not available"}
      </div>
    </CSSTransition> : null
};

RichTooltip.propTypes = {
  itemRect: PropTypes.object,
  positionClasses: PropTypes.string,
  prefer: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  toggles: getToggles,
  tooltip: getTooltip
})

export default connect(mapStateToProps)(RichTooltip);