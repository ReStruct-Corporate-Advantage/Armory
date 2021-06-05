import React, { memo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import * as repository from "./../";
import {ITEM_TYPE} from "./../../constants/types";
import "./ArmamentWrapper.component.scss";

const ArmamentWrapper = memo(props => {
  const {componentConfig, setSelectedComponent} = props;
  const Component = repository[componentConfig.name];

  const ref = useRef(null)

  // Use this component to be dragged and dropped on other potential drop targets
  const [{isDragging}, drag, preview] = useDrag({
    item: {type: ITEM_TYPE.ARMAMENT_WRAPPER, index: componentConfig.index, category: componentConfig},
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })
  
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Use this component for dropping other items
  const [, drop] = useDrop({
    accept: ITEM_TYPE.ARMAMENT_WRAPPER,
    hover: (item, monitor) => {
      console.log(item)
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = componentConfig.index
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
    drop: (item, monitor) => {
      console.log(monitor.getClientOffset())
    },
  })
  drag(drop(ref))


  return (
    <div
      className="c-ArmamentWrapper position-absolute"
      id={`${componentConfig.uuid}-RENDER`}
      ref={ref}
      style={{
        opacity: isDragging ? 0 : 1,
        cursor: "move",
        top: componentConfig.top,
        left: componentConfig.left
      }}
      onClick={() => setSelectedComponent(componentConfig.uuid)}>
        {Component && <Component {...componentConfig} />}
    </div>
  );
});

ArmamentWrapper.propTypes = {
  componentConfig: PropTypes.object,
  setSelectedComponent: PropTypes.func
};

export default ArmamentWrapper;