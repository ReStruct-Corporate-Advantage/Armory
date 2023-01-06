import React from "react";
import PropTypes from "prop-types";
import "./Widget.component.scss";

const Widget = props => {
  const {classes, header, content} = props;
  return (
    <div className={`c-Widget w-100 h-100 position-relative${classes ? " " + classes : ""}`}>
      <div className="c-Widget__header w-100 ps-3 py-1"><strong>{header || "Widget"}</strong></div>
      <div className="c-Widget__content w-100">{content}</div>
    </div>
  );
};

Widget.propTypes = {
  classes: PropTypes.string,
  header: PropTypes.string,
  content: PropTypes.object
};

export default Widget;