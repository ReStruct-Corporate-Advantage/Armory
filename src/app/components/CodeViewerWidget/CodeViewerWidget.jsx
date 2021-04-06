import React from "react";
import PropTypes from "prop-types";
import {CodeTree, SectionHeader} from "./../";
import "./CodeViewerWidget.component.scss";

const CodeViewerWidget = props => {
  return (
    <div className="c-Widget c-CodeViewerWidget h-50">
      <div className="code-view">
        <SectionHeader {...props} />
        <CodeTree />
      </div>
    </div>
  );
};

CodeViewerWidget.propTypes = {

};

export default CodeViewerWidget;