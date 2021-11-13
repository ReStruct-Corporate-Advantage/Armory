import React, {useRef} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getComponentConfig } from "../../pages/AdminComponentManager/selectors";
import { compGen } from "../../utils/CodeUtils/ComponentGenerator";
import "./ComponentEditor.component.scss";

const ComponentEditor = props => {
  const {componentConfig} = props;
  const comContainerRef = useRef();

  const item = componentConfig.component;
  const componentRender = item && compGen.generateComponentWithConfig(item, comContainerRef, "editor").item;

  return (
    <div className="c-ComponentEditor position-relative h-100" ref={comContainerRef} style={{background: "white"}}>
      <div className="c-ComponentContainer__renders position-absolute w-100 h-100">
        {componentRender}
      </div>
    </div>
  );
};

ComponentEditor.propTypes = {
  componentConfig: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentConfig: getComponentConfig
})

export default connect(mapStateToProps)(ComponentEditor);