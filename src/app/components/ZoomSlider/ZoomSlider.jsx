import React from "react";
import { LoadableIcon } from "..";
import "./ZoomSlider.component.scss";

const ZoomSlider = props => {
  const {hovered} = props;

  return (
    <div className="c-ZoomSlider d-inline ps-3 mt-2" onFocus={() => {}}>
        <span className="zoom-btn bg-white">
          <LoadableIcon icon="ai.AiOutlinePlusCircle" color="rgb(37, 86, 102)" size="1.8rem" />
        </span>
        <span className={`slider-container d-inline-block${hovered ? " hovered" : ""}`}>
          <input type="range" className="slider-input d-block" />
        </span>
    </div>
  );
};

export default ZoomSlider;