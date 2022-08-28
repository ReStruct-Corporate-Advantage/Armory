import React from "react";
import "./Button.component.scss";

const Button = props => {

  let {classes, displayValue, type, onClick, style} = props;
  classes = classes ? classes.split(" ") : [];

  if (~classes.findIndex(cls => cls.startsWith("btn-"))) {
    classes.push("btn btn-primary");
  }

  return (
    <button className={`c-Button ${classes.join(" ")}`} type={type} onClick={onClick ? onClick : null} style={style}>
      {displayValue ? displayValue : "Submit"}
    </button>
  );
};

export default Button;