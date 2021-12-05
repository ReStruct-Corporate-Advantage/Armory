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
    // <div className="position-fixed w-100 h-100 z-index-1"> // Add this container to enable hiding menu on clicking anywhere
      <CSSTransition in={props.show} timeout={100} classNames="expand" appear onEntered={() => {
        setItemPosition(Helper.getItemPosition(itemRef.current));
        setPositionCorrected(true);
      }}>
        <div className={`c-QuickOptionsContainer ${containerClasses}
          ${itemPosition && itemPosition.positionClass ? " " + itemPosition.positionClass : ""}
          ${positionCorrected ? " expand-enter-done" : ""}`}
          ref={itemRef}  style={itemPosition ? itemPosition.styles : {}} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </CSSTransition>
    // </div>
  );
};

QuickOptionsContainer.propTypes = {
  data: PropTypes.object
};

export default QuickOptionsContainer;