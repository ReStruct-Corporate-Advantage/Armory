import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Helper from "../../utils/Helper";
import "./QuickOptionsContainer.component.scss";

const QuickOptionsContainer = (props) => {
  const { children, show } = props;
  const itemRef = useRef(null);
  const containerClasses = "position-absolute tagged-container";
  const [itemPosition, setItemPosition] = useState({});

  useLayoutEffect(() => {
    show && setItemPosition(Helper.getItemStateInViewport(itemRef.current, {x: 240, y: 480}));
  }, [show]);

  return (
    <div
      className={`c-QuickOptionsContainer overflow-hidden ${containerClasses}
          ${
            itemPosition && itemPosition.positionClass
              ? " " + itemPosition.positionClass
              : ""
          }
          ${show ? " show" : ""}`}
      ref={itemRef}
      style={itemPosition ? itemPosition.styles : {}}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

QuickOptionsContainer.propTypes = {
  data: PropTypes.object,
};

export default QuickOptionsContainer;
