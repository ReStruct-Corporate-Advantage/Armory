import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, InputField } from "../..";
import "./FormField.component.scss";

const FormField = props => {
  const [state, setState] = useState({});
  const onChange = (formId, id, value) => {
    setState({value})
    props.onChange && props.onChange(value);
  }
  const getComponentByType = (type) => {
    switch (type) {
      case "input":
        return <InputField onChange={onChange} state={state} {...props.attributes} />;
      case "button":
        return <Button {...props} />;
      default:
        return null;
    }
  }
  return (
    <div className={`c-FormField d-inline-block${props.containerClasses ? " " + props.containerClasses : ""}`}>
      {getComponentByType(props.type)}
    </div>
  );
};

FormField.propTypes = {
  attributes: PropTypes.object
}

export default FormField;