import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import Helper from "../../utils/Helper";
import "./QuickOptionsContainer.component.scss";

const QuickOptionsContainer = props => {
  const {children, data} = props
  const itemRef = useRef(null);
  const containerClasses = "position-absolute tagged-container"
  const [itemPosition, setItemPosition] = useState({})

  useEffect(() => {
    itemRef && itemRef.current && setItemPosition(Helper.getItemPosition(itemRef.current));
  }, [itemRef])
  
  return (
    <CSSTransition in={true} timeout={500} classNames="expand" appear>
      <div className={`c-QuickOptionsContainer ${containerClasses}${itemPosition.positionClass ? " " + itemPosition.positionClass : ""}`} ref={itemRef}  style={itemPosition.styles} onClick={() => {}}>
        {children}
      </div>
    </CSSTransition>
  );
};

QuickOptionsContainer.propTypes = {
  data: PropTypes.object
};

export default QuickOptionsContainer;