import React from "react";
import "./Button.component.scss";

const Button = props => {
  return (
    <input type="button" className={`c-Button btn btn-primary${props.classes ? " " + props.classes : ""}`} onClick={props.onClick ? props.onClick : null}>
      {props.displayValue ? props.displayValue : "Submit"}
    </input>
  );
};

export default Button;