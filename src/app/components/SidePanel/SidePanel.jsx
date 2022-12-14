import React from "react";
import PropTypes from "prop-types";
import "./SidePanel.component.scss";

const SidePanel = props => {
  const {shouldDisplay, expanded} = props;
  return (
    <div className={`c-SidePanel position-fixed${shouldDisplay ? "" : " d-none"}`}>
      In Component SidePanel
    </div>
  );
};

SidePanel.propTypes = {
  shouldDisplay: PropTypes.bool,
  expanded: PropTypes.bool
};

export default SidePanel;