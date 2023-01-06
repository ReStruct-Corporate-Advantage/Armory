import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import usePageComponents from "../../hooks/usePageComponents";
import { getPresentComponentsConfig } from "../ComponentCreator/selectors";
import { getUserDetails } from "../../global-selectors";
import { dispatchLevels } from "../../global-actions";
import {
  dispatchComponentsConfig,
  dispatchSelectedComponent,
} from "../ComponentCreator/actions";
import { SidePanel } from "../../components";
import * as components from "../../components";
import DASHBOARD_CONFIG from "../../config/dashboardNewConfig";
import "./DashboardNew.module.scss";

const DashboardNew = (props) => {
  const {
    navigate,
    userDetails,
  } = props;
  const [hoverState, setHoverState] = useState({});
  const { DrawerConfig, SidePanelConfig, WidgetConfig } = usePageComponents(DASHBOARD_CONFIG);
  const [drawerState, setDrawerState] = useState({collapsed: !(DrawerConfig && DrawerConfig.initialExpanded)});
  const [sidePanelState, setSidePanelState] = useState({visible: !(SidePanelConfig && SidePanelConfig.initialVisible)});
  const name = userDetails ? userDetails.firstname : "";
  const drawerWidth = drawerState.collapsed ? DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED : DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED;
  const sidePanelWidth = sidePanelState.visible ? DASHBOARD_CONFIG.SIDEPANEL_WIDTH : 0;

  useEffect(() => {
    document.body.classList.contains("body-modifier") && document.body.classList.remove("body-modifier");
  }, []);

  const layoutWidgets = widgetConfigs => {
    const laidoutConfigs = [];
    widgetConfigs && widgetConfigs.forEach(config => {
      const layout = config.layout && config.layout.split(".");
      if (layout) {
        const row = +layout[0];
        const col = +layout[1];
        const span = layout[2];
        if (!laidoutConfigs[row]) {
          laidoutConfigs[row] = [];
        }
        laidoutConfigs[row][col] = config;
        config.colClass = "col-" + span;
      }
    })
    return laidoutConfigs;
  }

  const renderWidgets = () => {
    const laidOutConfigs = layoutWidgets(WidgetConfig);
    return laidOutConfigs && laidOutConfigs.map((row, rowI) => {
      return <div key={"widget-row-" + rowI} className="row mb-3" style={{flexGrow: rowI === 1 ? rowI : 8}}>
        {row.map((config, colI) => {
          const { header, component, type, typeClasses, ...contentConfig } = config;
          const Component = components[component];
          const Type = components[type];
          return <div key={"widget-col-" + rowI + "-" + colI} className={config.colClass}>
            <Type
              classes={typeClasses}
              key={"dashboard-widget-" + rowI + "-" + colI}
              header={header}
              navigate={navigate}
              content={<Component data={contentConfig} user={userDetails} navigate={navigate} />}
            />
          </div>
        })}
      </div>
    })
    WidgetConfig.map((config, i) => {
      
      })
  }

  return (
    <div className="c-DashboardNew d-flex flex-grow-1">
      <main className="c-Dashboard__main overflow-auto d-flex flex-column flex-grow-1 bg-white p-3" style={{width: `calc(100% - ${drawerWidth} - ${sidePanelWidth}`}}>
        <div className="row mb-3">
          <h3 className="c-Dashboard__main__header c-Dashboard__main-default-font-color text-start mb-0">
            Welcome {name}
          </h3>
          <strong className="c-Dashboard__secondary-font-color">
            Let's get started with your stuff
          </strong>
        </div>
        {WidgetConfig && renderWidgets()}
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
  navigate: PropTypes.func,
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
