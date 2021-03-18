import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import {dispatchLayout, dispatchPreviousLayout} from "./../../pages/Home/actions";
import { getLayout, getPreviousLayout } from "../../pages/Home/selectors";
import Layout from "../../entities/Layout";
import * as images from "./../../static/images";
import "./LayoutSelector.component.scss";

const LayoutSelector = props => {

  const calculateLayout = (layout) => {
    const previousLayoutIndex = Layout.LAYOUT_VALS.findIndex(val => val === props.layout);
    let layoutValue;
    if (layout === Layout.SHRINK) {
      layoutValue = Layout.LAYOUT_VALS[previousLayoutIndex === 0 ? previousLayoutIndex : previousLayoutIndex - 1];
    } else if (layout === Layout.EXPAND) {
      layoutValue = Layout.LAYOUT_VALS[previousLayoutIndex === Layout.LAYOUT_VALS.length - 1 ? previousLayoutIndex : previousLayoutIndex + 1];
    }
    return layoutValue;
  }

  const updateLayout = (layout) => {
    const layoutValue = calculateLayout(layout);
    props.layout !== layoutValue && props.dispatchLayout(layoutValue);
  }
  
  return (
    <div className="c-LayoutSelector">
      <div className="pr-3 pl-2 d-inline-block"><img src={images.LayoutShrink} alt="Shrink" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.SHRINK)} /></div>
      <div className="pr-3 d-inline-block"><img src={images.LayoutExpand} alt="Expand" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.EXPAND)} /></div>
      <div className="pr-1 d-inline-block"><img src={images.LayoutCustom} alt="Custom" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.CUSTOM)} /></div>
    </div>
  );
};

LayoutSelector.propTypes = {
  dispatchLayout: PropTypes.func,
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  layout: getLayout
})

const mapDispatchToProps = {
  dispatchLayout,
  dispatchPreviousLayout
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutSelector);