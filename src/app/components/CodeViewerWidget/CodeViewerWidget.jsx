import React from "react";
import PropTypes from "prop-types";
import {CodeTree, SectionHeader, ToolBox} from "./../";
import {TOOLS_CONFIG} from "./../../config"
import "./CodeViewerWidget.component.scss";

const CodeViewerWidget = props => {
  const {selectedComponent, setSelectedComponent} = props;
  return (
    <div className="c-CodeViewerWidget c-Widget d-flex flex-column h-50">
      <SectionHeader {...props} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_VIEWER_TOOLS} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_VIEWER_LANGUAGE_TOOLS} />
      <CodeTree selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} />
    </div>
  );
};

CodeViewerWidget.propTypes = {
  setSelectedComponent: PropTypes.func
};

export default CodeViewerWidget;