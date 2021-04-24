import React from "react";
import {CodeLineController, CodeTree, SectionHeader, ToolBox} from "./../";
import {TOOLS_CONFIG} from "./../../config"
import "./CodeViewerWidget.component.scss";

const CodeViewerWidget = props => {
  return (
    <div className="c-CodeViewerWidget c-Widget d-flex flex-column h-50">
      <SectionHeader {...props} />
      <ToolBox toolsConfig={TOOLS_CONFIG.CODE_VIEWER_TOOLS} />
      <CodeTree />
    </div>
  );
};

CodeViewerWidget.propTypes = {

};

export default CodeViewerWidget;