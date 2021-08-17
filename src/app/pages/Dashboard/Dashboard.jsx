import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getUserDetails } from "./../../global-selectors";
import DASHBOARD_CONFIG from "../../config/dashboardConfig";
import "./Dashboard.module.scss";

const Dashboard = props => {
  const { history, userDetails } = props;
  const name = userDetails ? userDetails.firstname : ""
  const sections = DASHBOARD_CONFIG && Object.keys(DASHBOARD_CONFIG).map(key => {
    const section = DASHBOARD_CONFIG[key];
    const display = section.protected ? userDetails && userDetails.role && userDetails.role === "alpha" : true;
    const parts = section.parts;
    return display &&
      <div className={section.containerClasses}>
        <div className={section.sectionClasses}>
          <div className="row">
            {parts && parts.map(part => {
              switch (part.type) {
                case "p":
                  return <p className={part.classes}>{part.text}</p>
                case "button":
                  return <button className={part.classes} onClick={() => part.action(history, userDetails)}>{part.text}</button>
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
  })
  return (
    <div className="c-Dashboard d-flex flex-column h-100">
      <main className="c-Dashboard__main p-4 mb-5 overflow-auto text-center flex-grow-1">
        <h4 className="page-header glass-panel text-left">Welcome {name}!</h4>
        <div className="content row mt-5">
          {sections}
        </div>
      </main>
    </div>
  );
};

Dashboard.propTypes = {
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  userDetails: getUserDetails
})

export default connect(mapStateToProps)(withRouter(Dashboard));