import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getComponentsConfig } from "../../pages/ComponentCreator/selectors";
import CodeGenerator from "../../utils/CodeGenerator";
import "./CodeTree.component.scss";

const CodeTree = props => {
  const code = CodeGenerator.generate(props.componentsConfig.components);

  return (
    <div className="c-CodeTree">
      <code>
        {"<div id='root'>"}<br />
          {!code ? <p style={{fontSize: "0.6rem", color: "green !important", marginBottom: 0}}>// Add components from the left panel to view them here</p> : code}
        {"</div>"}
      </code>
    </div>
  );
};

CodeTree.propTypes = {
  componentsConfig: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getComponentsConfig
})

export default connect(mapStateToProps)(CodeTree);