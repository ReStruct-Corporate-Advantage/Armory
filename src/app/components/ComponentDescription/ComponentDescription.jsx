import React from "react";
import PropTypes from "prop-types";
import {repository} from "../../utils/CodeUtils/ComponentGenerator";
import "./ComponentDescription.component.scss";

const ComponentDescription = props => {
  const {description} = props;
  // const name = description && description.name ? description.name.toLowerCase() : "";
  const displayName = description && description.displayName ? description.displayName.toLowerCase() : "";
  const tags = description && description.meta && description.meta.tags ? description.meta.tags : [];
  const createdBy = description && description.meta ? description.meta.createdBy  : "";
  description.descriptor = description.descriptor ? description.descriptor : {};
  description.descriptor.classes = description.descriptor.classes ? description.descriptor.classes : "";
  // description.descriptor.classes.indexOf("ms-4 mt-3") < 0 && (description.descriptor.classes += " ms-4 mt-3");
  const Component = repository[description.name];
  const componentRender = Component ? <Component {...description} /> : null;
  return (
    <div className="c-ComponentDescription text-start overflow-auto text-white">
      <span className="c-ComponentDescription__render ms-4 mt-3">{componentRender}</span>
      <hr style={{background: "white"}} />
      <span className="d-block">Name: {displayName}</span>
      {tags && <span className="d-block">Tags: [{tags.join(", ")}]</span>}
      <span className="d-block">Created By: {createdBy}</span>
    </div>
  );
};

ComponentDescription.propTypes = {
  description: PropTypes.object
};

export default ComponentDescription;