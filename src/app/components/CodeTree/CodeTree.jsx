import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import {TransitionGroup} from "react-transition-group";
import { getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import CodeGenerator from "../../utils/CodeUtils/CodeGenerator";
import "./CodeTree.component.scss";

const CodeTree = props => {
  const [components, setComponents] = useState(props.componentsConfig.components);

  useEffect(() => {
    setComponents(props.componentsConfig.components);
  }, [props.componentsConfig.components])
  
  const code = CodeGenerator.generate(components, props.dispatchSelectedComponent);

  return (
    <TransitionGroup className="c-CodeTree h-100">
      {code}
    </TransitionGroup>
  );
};

CodeTree.propTypes = {
  componentsConfig: PropTypes.object,
  dispatchSelectedComponent: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig
})

export default connect(mapStateToProps)(CodeTree);