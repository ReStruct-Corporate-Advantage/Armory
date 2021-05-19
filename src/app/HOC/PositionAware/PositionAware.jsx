import React from "react";
import PropTypes from "prop-types";
import * as $ from "jquery";
import "./PositionAware.component.scss";

const PositionAware = Component => {
  return class extends React.Component {

    constructor(props) {
      super(props);
      this.checkHeader();
    }

    checkHeader () {
      const container = $("[style*="position:fixed"]");
      const header = container.find("header");
      console.log(container);
      console.log(header);
    }

    render () {return <Component />};
  }
};

PositionAware.propTypes = {

};

export default PositionAware;