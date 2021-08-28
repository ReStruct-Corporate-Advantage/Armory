import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getUserDetails } from "./../../global-selectors";
import { getPresentComponentsConfig } from "../ComponentCreator/selectors";
import { dispatchLevels } from "../../global-actions";
import { dispatchComponentsConfig, dispatchSelectedComponent } from "../ComponentCreator/actions";
import DASHBOARD_CONFIG from "../../config/dashboardConfig";
import "./Dashboard.module.scss";

const Dashboard = props => {
  const { componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails } = props;
  const name = userDetails ? userDetails.firstname : ""
  const config = DASHBOARD_CONFIG ? {...DASHBOARD_CONFIG} : {}
  const sections = Object.keys(config).map(key => {
    const section = {...config[key]};
    config[key] = section;
    const display = section.protected ? userDetails && userDetails.role && userDetails.role === "alpha" : true;
    const parts = [...section.parts];
    section.parts = parts;
    const header = parts && parts.find(part => part.type === "header");
    parts && parts.splice(parts.findIndex(part => part.type === "header"), 1);
    return display &&
      <div className={section.containerClasses}>
        <div className={section.sectionClasses}>
          <div className="h-100 d-flex flex-column">
            {header && <p className={header.classes}>{header.text}</p>}
            <div className="c-Dashboard__actions w-100">
              {parts && parts.map(part => {
                switch (part.type) {
                  case "p":
                    return <p className={part.classes}>{part.text}</p>
                  case "button":
                    return <button className={part.classes} onClick={() => part.action(componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, history, userDetails)}>{part.text}</button>
                  default:
                    return null;
                }
              })}
            </div>
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
  componentsConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  dispatchLevels: PropTypes.func,
  dispatchSelectedComponent: PropTypes.func,
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig,
  userDetails: getUserDetails
})

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchLevels,
  dispatchSelectedComponent
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Dashboard));