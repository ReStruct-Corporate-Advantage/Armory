import React from "react";
import "./Button.component.scss";

const Button = props => {

  let {classes, displayValue, type, onClick, style} = props;
  classes = classes ? classes.split(" ") : [];

  if (~classes.findIndex(cls => cls.startsWith("btn-"))) {
    classes.push("btn btn-primary");
  }

  const outgoingProps = {};
  outgoingProps.className = `c-Button ${classes.join(" ")}`;
  onClick && (outgoingProps.onClick = onClick);
  style && (outgoingProps.style = style);
  outgoingProps.type = type || "button";
  
  return (
    <button {...outgoingProps}>
      {displayValue ? displayValue : "Submit"}
    </button>
  );
};

export default Button;