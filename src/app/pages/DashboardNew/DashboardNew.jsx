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
import { Network } from "../../utils";
import DASHBOARD_CONFIG from "../../config/dashboardNewConfig";
import ENDPOINTS from "../../constants/endpoints";
import "./DashboardNew.module.scss";

const DashboardNew = (props) => {
  const {
    drawerWidth,
    navigate,
    rawData,
    setRawData,
    userDetails,
  } = props;
  const { SidePanelConfig, WidgetConfig } = usePageComponents(DASHBOARD_CONFIG);
  const [sidePanelState, setSidePanelState] = useState({visible: !(SidePanelConfig && SidePanelConfig.initialVisible)});
  const name = userDetails ? userDetails.firstname : "";

  const sidePanelWidth = sidePanelState.visible ? DASHBOARD_CONFIG.SIDEPANEL_WIDTH : 0;

  useEffect(() => {
    if (!rawData) {
      const types = ["Page", "Component", "Project"]
      const final = {};
      const promise = Promise.all([
        Network.get(ENDPOINTS.BE.PAGE.GET + ENDPOINTS.BE.PAGE.root),
        Network.get(ENDPOINTS.BE.COMPONENT.GET + ENDPOINTS.BE.COMPONENT.root),
        Network.get(ENDPOINTS.BE.PROJECT.GET + ENDPOINTS.BE.PROJECT.root)
      ]);
      promise.then(responses => {
        responses.forEach((item, i) => {
          final[types[i]] = item.body;
          item.body.forEach(subItem => subItem.type = types[i]);
        });
        setRawData(final);
      });
    }
  }, []);

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
          const { actions, header, component, type, typeClasses, listType, ...contentConfig } = config;
          const Component = components[component];
          const Type = components[type];
          return <div key={"widget-col-" + rowI + "-" + colI} className={config.colClass}>
            <Type
              actions={actions}
              classes={typeClasses}
              key={"dashboard-widget-" + rowI + "-" + colI}
              header={header}
              navigate={navigate}
              user={userDetails}
              content={<Component key={component + "-" + colI} data={contentConfig} type={listType}
                user={userDetails} navigate={navigate} rawData={rawData} />}
            />
          </div>
        })}
      </div>
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
            Here's a quick summary of your works
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
