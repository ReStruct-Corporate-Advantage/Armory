import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {dispatchZoom} from "../../global-actions";
import { LoadableIcon } from "..";
import "./ZoomSlider.component.scss";

const ZoomSlider = props => {
  const {dispatchZoom, hovered} = props;

  return (
    <div className="c-ZoomSlider col px-2 pt-2" onFocus={() => {}}>
      <div className="row">
        <span className="col">
          <LoadableIcon icon="ai.AiOutlinePlusCircle" color="rgb(37, 86, 102)" size="1.5rem" />
        </span>
        <span className={`slider-container col-10${hovered ? " hovered" : ""}`}>
          <input type="range" className="slider-input d-block" onChange={e => dispatchZoom(e.target.value)} />
        </span>
      </div>
    </div>
  );
};

ZoomSlider.propTypes = {
  dispatchZoom: PropTypes.number
}

const mapDispatchToProps = {
  dispatchZoom
}

export default connect(null, mapDispatchToProps)(ZoomSlider);