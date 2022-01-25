import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../../global-selectors";
import { getPresentComponentsConfig } from "../ComponentCreator/selectors";
import { dispatchLevels } from "../../global-actions";
import { dispatchComponentsConfig, dispatchSelectedComponent } from "../ComponentCreator/actions";
import DASHBOARD_CONFIG from "../../config/dashboardConfig";
import "./Dashboard.module.scss";

const Dashboard = props => {
  const { componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, userDetails } = props;
  const [hoverState, setHoverState] = useState({});
  const navigate = useNavigate();
  const name = userDetails ? userDetails.firstname : "";
  const config = DASHBOARD_CONFIG ? {...DASHBOARD_CONFIG} : {};

  const sections = Object.keys(config).map(key => {
    const section = {...config[key]};
    config[key] = section;
    const display = section.protected ? userDetails && userDetails.role && userDetails.role === "alpha" : true;
    const parts = [...section.parts];
    section.parts = parts;
    const header = parts && parts.find(part => part.type === "header");
    parts && parts.splice(parts.findIndex(part => part.type === "header"), 1);

    const getSubOptions = (part, hovered) => {
      return <div className="col-7 offset-4">
            <div className={`row m-2 p-2 sub-option${!hovered ? " unhovered" : ""}`}>
              {
                part.subOptions.map(subOption => <button className={subOption.classes}
                  onClick={() => subOption.action(componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, navigate, userDetails)}>
                    {subOption.text}
                </button>
                )
              }
            </div>
          </div>;
    }

    return display &&
      <div className={"c-Dashboard__panel__container " + section.containerClasses}>
        <div className={section.sectionClasses}>
          <div className="h-100 d-flex bg-white flex-column">
            {header && <p className={header.classes}>{header.text}</p>}
            <div className="c-Dashboard__actions w-100">
              {parts && parts.map(part => {
                switch (part.type) {
                  case "p":
                    return <p className={part.classes}>{part.text}</p>
                  case "button":
                    const hovered = hoverState && hoverState[part.name];
                    return <div className="c-Dashboard__action col-12">
                            <div className="row ms-0"
                              onClick={() => part.action(componentsConfig, dispatchComponentsConfig, dispatchLevels, dispatchSelectedComponent, navigate, userDetails)}
                              onMouseOver={() => setHoverState({...hoverState, [part.name]: true})}
                              onMouseLeave={() => setHoverState({...hoverState, [part.name]: false})}>
                              <button className={`${part.classes} my-auto`}>
                                  {part.text}
                              </button>
                              {part.subOptions && getSubOptions(part, hovered)}
                            </div>
                          </div>
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
      <main className="c-Dashboard__main p-4 mb-5overflow-auto text-center flex-grow-1">
        <h4 className="page-header bg-white text-start">Welcome {name}!</h4>
        <div className="content row mt-3">
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);