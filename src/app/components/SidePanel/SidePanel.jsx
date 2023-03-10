import React from "react";
import PropTypes from "prop-types";
import "./SidePanel.component.scss";

const SidePanel = props => {
  const {shouldDisplay, fixed, expanded} = props;
  return (
    <div className={`c-SidePanel h-100${shouldDisplay ? "" : fixed ? " d-none" : " w-0"}`}>
      In Component SidePanel
    </div>
  );
};

SidePanel.propTypes = {
  shouldDisplay: PropTypes.bool,
  expanded: PropTypes.bool
};

export default SidePanel;