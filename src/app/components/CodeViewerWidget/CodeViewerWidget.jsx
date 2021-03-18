import React from "react";
import PropTypes from "prop-types";
import "./CodeViewerWidget.component.scss";

const CodeViewerWidget = props => {
  return (
    <div className="c-Widget c-CodeViewerWidget h-50">
      <div className="code-view">
        <code>
          {"<testcode>"}
        </code>
      </div>
    </div>
  );
};

CodeViewerWidget.propTypes = {

};

export default CodeViewerWidget;