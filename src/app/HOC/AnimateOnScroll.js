import React, {useEffect} from "react";
import useElementOnScreen from "../hooks/useElementOnScreen";

const AnimateOnScroll = props => {
  const { animateBorder, classes, children, hiddenClasses, name, reappear, setCurrentVisible, threshold = 0.2, visibleClasses, duration = 1000 } = props;
  const [containerRef, isVisible] = useElementOnScreen({threshold, reappear});
  const currentClass = animateBorder || isVisible
    ? visibleClasses
    : hiddenClasses;

  useEffect(() => {
    isVisible && setCurrentVisible && name && setCurrentVisible(name);
  }, [isVisible]);

  return <div
        ref={containerRef}
        className={`transition ${currentClass}${classes ? " " + classes : ""}`}>
        {typeof children === "function" ? children(currentClass) : children}
    </div>
};

export default AnimateOnScroll;
