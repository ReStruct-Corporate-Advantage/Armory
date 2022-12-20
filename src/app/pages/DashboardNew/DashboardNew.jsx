import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPropsSelector } from "reselect-immutable-helpers";
import usePageComponents from "../../hooks/usePageComponents";
import { getPresentComponentsConfig } from "../ComponentCreator/selectors";
import { getUserDetails } from "../../global-selectors";
import { dispatchLevels } from "../../global-actions";
import {
  dispatchComponentsConfig,
  dispatchSelectedComponent,
} from "../ComponentCreator/actions";
import { Drawer, SidePanel, Summary, Widget } from "../../components";
import DASHBOARD_CONFIG from "../../config/dashboardNewConfig";
import "./DashboardNew.module.scss";

const DashboardNew = (props) => {
  const {
    componentsConfig,
    dispatchComponentsConfig,
    dispatchLevels,
    dispatchSelectedComponent,
    userDetails,
  } = props;
  const [hoverState, setHoverState] = useState({});
  const { DrawerConfig, SidePanelConfig, WidgetConfig } =
  usePageComponents(DASHBOARD_CONFIG);
  const [drawerState, setDrawerState] = useState({collapsed: !(DrawerConfig && DrawerConfig.initialExpanded)});
  const [sidePanelState, setSjidePanelState] = useState({visible: !(SidePanelConfig && SidePanelConfig.initialVisible)});
  const navigate = useNavigate();
  const name = userDetails ? userDetails.firstname : "";
  const config = DASHBOARD_CONFIG ? { ...DASHBOARD_CONFIG } : {};
  const drawerWidth = drawerState.collapsed ? DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED : DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED;
  const sidePanelWidth = sidePanelState.visible ? DASHBOARD_CONFIG.SIDEPANEL_WIDTH : 0;

  useEffect(() => {
    document.body.classList.contains("body-modifier") && document.body.classList.remove("body-modifier");
  }, []);

  return (
    <div className="c-DashboardNew d-flex flex-grow-1">
      {DrawerConfig && (
        <Drawer
          type="app-drawer"
          config={{
            ...DrawerConfig,
            collapseWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED,
            expandWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED,
          }}
          state={drawerState}
          setState={setDrawerState}
        />
      )}
      <main className="c-Dashboard__main overflow-auto d-flex flex-grow-1 bg-white" style={{width: `calc(100% - ${drawerWidth} - ${sidePanelWidth}`}}>
        <h5 className="c-Dashboard__main__header c-Dashboard__main-default-font-color page-header text-start">
          Welcome {name}
        </h5>
        <strong className="c-Dashboard__main-default-font-color">
          Let's get started with your stuff
        </strong>
        {WidgetConfig &&
          WidgetConfig.map((config) => {
            const { header, ...contentConfig } = config;
            return (
              <Widget
              header={header}
              content={<Summary data={contentConfig} />}
              />
              );
            })}
      </main>
      {SidePanelConfig && <SidePanel config={SidePanelConfig} />}
    </div>
  );
};

DashboardNew.propTypes = {};

DashboardNew.propTypes = {
  componentsConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  dispatchLevels: PropTypes.func,
  dispatchSelectedComponent: PropTypes.func,
  userDetails: PropTypes.object,
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig,
  userDetails: getUserDetails,
});

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchLevels,
  dispatchSelectedComponent,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardNew);
