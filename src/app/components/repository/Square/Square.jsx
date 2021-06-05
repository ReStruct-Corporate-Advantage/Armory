import React from "react";
import "./Square.component.scss";

const Square = props => {
  const {descriptor, id} = props;
  return (
    <div className="c-Square" id={id} style={{height: descriptor && descriptor.defaultHeight, width: descriptor && descriptor.defaultWidth}}>
      
    </div>
  );
};

export default Square;