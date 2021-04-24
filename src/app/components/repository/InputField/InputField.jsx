import React from "react";
import PropTypes from "prop-types";
import "./InputField.component.scss";

const InputField = props => {
  const {id, descriptor} = props
  return (
    <div id={id}
      className="c-InputField" 
      style={{
        height: descriptor && descriptor.defaultHeight,
        width: descriptor && descriptor.defaultWidth
      }}>
      <input type="text"/>
    </div>
  );
};

InputField.propTypes = {
  descriptor: PropTypes.object
};

export default InputField;