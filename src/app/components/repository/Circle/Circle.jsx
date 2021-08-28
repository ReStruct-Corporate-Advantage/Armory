import React from "react";
import "./Circle.component.scss";

const Circle = props => {
  const {descriptor, id} = props;
  return (
    <div className="c-Circle" id={id} style={{height: descriptor && descriptor.defaultHeight, width: descriptor && descriptor.defaultWidth, borderRadius: "50%"}}>

    </div>
  );
};

export default Circle;