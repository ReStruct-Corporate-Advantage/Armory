import React, {useState} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import {dispatchLayout, dispatchPreviousLayout} from "../../pages/ComponentCreator/actions";
import { getLayout, getPreviousLayout } from "../../pages/ComponentCreator/selectors";
import { ZoomSlider } from "..";
import Layout from "../../entities/Layout";
import Helper from "../../utils/Helper";
import * as images from "../../static/images";
import "./LayoutSelector.component.scss";

const LayoutSelector = props => {
  const {layout} = props
  const [hovered, setHovered] = useState(false);

  const updateLayout = (layoutOrder) => {
    const layoutValue = Helper.calculateLayout(layoutOrder, layout);
    if (props.layout !== layoutValue) {
      props.dispatchLayout(layoutValue);
    }
  }
  
  return (
    <div className={`c-LayoutSelector position-absolute row${hovered ? " hover" : ""}`}
      onFocus={() => {}}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className={`${hovered ? "col-1 mx-2" : "col"} ps-2 btn`}><img src={images.LayoutShrink} alt="Shrink" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.SHRINK)} /></div>
      <div className={`${hovered ? "col-1 mx-2" : "col"} ps-2 btn`}><img src={images.LayoutExpand} alt="Expand" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.EXPAND)} /></div>
      <div className={`${hovered ? "col-1 mx-2" : "col"} ps-2 btn`}><img src={images.LayoutCustom} alt="Custom" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.CUSTOM)} /></div>
      <ZoomSlider hovered={hovered} />
    </div>
  );
};

LayoutSelector.propTypes = {
  dispatchLayout: PropTypes.func,
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string,
  previousLayout: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  layout: getLayout,
  previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchLayout,
  dispatchPreviousLayout
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutSelector);