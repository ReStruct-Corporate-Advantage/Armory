import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import {dispatchLayout, dispatchPreviousLayout} from "./../../pages/ComponentCreator/actions";
import { getLayout, getPreviousLayout } from "../../pages/ComponentCreator/selectors";
import Layout from "../../entities/Layout";
import Helper from "../../utils/Helper";
import * as images from "./../../static/images";
import "./LayoutSelector.component.scss";

const LayoutSelector = props => {
  const {layout} = props

  const updateLayout = (layoutOrder) => {
    const layoutValue = Helper.calculateLayout(layoutOrder, layout);
    if (props.layout !== layoutValue) {
      props.dispatchLayout(layoutValue);
    }
  }
  
  return (
    <div className="c-LayoutSelector position-absolute">
      <div className="pr-3 pl-2 d-inline-block btn"><img src={images.LayoutShrink} alt="Shrink" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.SHRINK)} /></div>
      <div className="pr-3 d-inline-block btn"><img src={images.LayoutExpand} alt="Expand" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.EXPAND)} /></div>
      <div className="pr-1 d-inline-block btn"><img src={images.LayoutCustom} alt="Custom" className="scaleUpAndShadow" onClick={() => updateLayout(Layout.CUSTOM)} /></div>
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