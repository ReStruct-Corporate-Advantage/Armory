import React, { memo, useRef } from "react";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import * as repository from "./../";
import {ITEM_TYPE} from "./../../constants/types";
import "./ArmamentWrapper.component.scss";

const ArmamentWrapper = memo(props => {
  const {componentConfig} = props;
  const Component = repository[componentConfig.name];
//   console.log(ReactDOMServer.renderToString(<Component />));

  const ref = useRef(null)
  
  // Use this component to be dragged and dropped on other potential drop targets
  const [{isDragging}, drag] = useDrag({
    item: {type: ITEM_TYPE.ARMAMENT_WRAPPER, index: componentConfig.index, category: componentConfig},
    end(item, monitor) {
      // const dr = monitor.getDropResult();
//       console.log(dr);
      // if (monitor.didDrop() && item.listId !== dropListId) {
      //   removearmament(index, listId)
      // }
    },
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
  })

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
//       console.log("drag " + dragIndex)
//       console.log("hover " + hoverIndex)
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
      // let componentsConfigClone;
      // const {left, top} = comContainerRef.current.getBoundingClientRect();
      // const dropCoords = monitor.getClientOffset();
      // componentsConfigClone = {...componentsConfig};
      // const componentsClone = [...componentsConfigClone.components];
      // componentsConfigClone.components = componentsClone;
      // if (item.type === ITEM_TYPE.ARMAMENT) {
      //   componentsConfigClone.count = componentsConfigClone.count + 1;
      //   componentsClone.push({name: item.category.componentName, index: componentsConfigClone.count, top: dropCoords.y - top, left: dropCoords.x - left})
      // } else {
      //   componentsClone.splice(componentsClone.indexOf(item.category), 1)
      //   componentsClone.push({name: item.category.name, index: item.index, top: dropCoords.y - top, left: dropCoords.x - left})
      // }
      // updateComponentsConfig(componentsConfigClone);
      // if (id !== item.listId) {
      //   // pushCard(item.card);
      // }
      // return {listId: id}
    },
  })
  drag(drop(ref))


  return (
    <div
      id={`arm-${componentConfig.index}`}
      className="c-ArmamentWrapper position-absolute"
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        top: componentConfig.top,
        left: componentConfig.left
      }}>
        {Component && <Component {...componentConfig} />}
    </div>
  );
});

ArmamentWrapper.propTypes = {
  componentConfig: PropTypes.object
};

export default ArmamentWrapper;