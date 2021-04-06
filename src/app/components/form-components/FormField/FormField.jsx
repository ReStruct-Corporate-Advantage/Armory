import React, { useState } from "react";
import PropTypes from "prop-types";
import "./FormField.component.scss";
import { Button, InputField } from "../..";

const FormField = props => {
  const [state, setState] = useState({});
  const onChange = (e) => setState({value: e.target.value})
  const getComponentByType = (type) => {
    switch (type) {
      case "input":
        return <InputField onChange={onChange} {...props} />;
      case "button":
        return <Button {...props} />
    }
  }
  return (
    <div className={`c-FormField d-inline-block${props.containerClasses ? " " + props.containerClasses : ""}`}>
      {getComponentByType(props.type)}
    </div>
  );
};

FormField.propTypes = {

};

export default FormField;