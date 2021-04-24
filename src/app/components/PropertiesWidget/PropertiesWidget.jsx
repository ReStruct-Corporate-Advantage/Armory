import React from "react";
import {SectionHeader, PropsForm, ToolBox} from "./../";
import {TOOLS_CONFIG} from "./../../config"
import "./PropertiesWidget.component.scss";

const PropertiesWidget = props => {
  return (
    <div className="c-Widget c-PropertiesWidget d-flex flex-column flex-nowrap h-50">
      <SectionHeader {...props} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_PROPERTIES_TOOLS} />
      <PropsForm />
    </div>
  );
};

PropertiesWidget.propTypes = {
  
};

export default PropertiesWidget;