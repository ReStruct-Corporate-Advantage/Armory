import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import {CSSTransition} from "react-transition-group";
import Helper from "../../utils/Helper";
import "./QuickOptionsContainer.component.scss";

const QuickOptionsContainer = props => {
  const {children} = props
  const itemRef = useRef(null);
  const containerClasses = "position-absolute tagged-container"
  const [itemPosition, setItemPosition] = useState({})
  const [positionCorrected, setPositionCorrected] = useState(false)

  // useEffect(() => {
  //   itemRef && itemRef.current && setItemPosition(Helper.getItemPosition(itemRef.current));
  // }, [itemRef])
  
  return (
    <CSSTransition in={props.show} timeout={100} classNames="expand" appear onEntered={() => {
      setItemPosition(Helper.getItemPosition(itemRef.current));
      setPositionCorrected(true);
    }}>
      <div className={`c-QuickOptionsContainer ${containerClasses}${itemPosition.positionClass ? " " + itemPosition.positionClass : ""}${positionCorrected ? " expand-enter-done" : ""}`} ref={itemRef}  style={itemPosition.styles} onClick={() => {}}>
        {children}
      </div>
    </CSSTransition>
  );
};

QuickOptionsContainer.propTypes = {
  data: PropTypes.object
};

export default QuickOptionsContainer;