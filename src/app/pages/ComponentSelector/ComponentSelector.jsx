import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {isMobile} from "./selectors";
import {dispatchDeviceType} from "./actions";
import Helper from "../../utils/Helper";
import "./ComponentSelector.module.scss";

const ComponentSelector = props => {

  const {dispatchDeviceType} = props
  useEffect(() => {
    dispatchDeviceType({isMobile: Helper.isMobile()})
    document.body.classList.add("body-board-view")
  }, [dispatchDeviceType])
  
  return (
    <div className="c-ComponentSelector">
      In Page ComponentSelector
    </div>
  );
};

ComponentSelector.propTypes = {
  isMobile: PropTypes.bool,
  dispatchDeviceType: PropTypes.func
};


const mapStateToProps = createPropsSelector({
  isMobile: isMobile
})

const mapDispatchToProps = {
  dispatchDeviceType
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComponentSelector);