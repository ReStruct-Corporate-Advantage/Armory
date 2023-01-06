import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getLoaderState } from "../../global-selectors";
import { PageLoader } from "../../static/images";
import "./Loader.component.scss";

const Loader = props => {
  const {loaderState} = props;
  return (
    <div className={`c-Loader position-fixed w-100 h-100 top-0 justify-content-center align-items-center 
    ${loaderState && Object.values(loaderState).indexOf(true) > -1 ? "d-flex" : "d-none"}`}>
      <img className="c-Loader__loader-image" src={PageLoader} height="80" width="120" />
    </div>
  );
};

Loader.propTypes = {
  loaderState: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  loaderState: getLoaderState
})

export default connect(mapStateToProps)(Loader);