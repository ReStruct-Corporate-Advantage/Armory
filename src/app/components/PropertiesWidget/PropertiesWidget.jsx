import React from "react";
import PropTypes from "prop-types";
import {SectionHeader, PropsForm} from "./../";
import "./PropertiesWidget.component.scss";

const PropertiesWidget = props => {
  return (
    <div className="c-Widget c-PropertiesWidget h-50">
      <SectionHeader {...props} />
      <PropsForm />
    </div>
  );
};

PropertiesWidget.propTypes = {
  
};

export default PropertiesWidget;