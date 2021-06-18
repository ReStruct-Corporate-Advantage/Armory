import React, { memo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { useDrag, useDrop } from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import { getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import { dispatchClearPropsState, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import {forkedRepository, repository} from "./../../utils/CodeUtils/ComponentGenerator";
import useEventHandler from "../../utils/useEventHandler";
import dndUtil from "../../utils/dndUtil";
import {ITEM_TYPE} from "./../../constants/types";
import "./ArmamentWrapper.component.scss";

const ArmamentWrapper = props => {
  const {componentConfig, componentsConfig, setComponentsConfig, dispatchClearPropsState, recursiveRenderer, selectedComponent, setSelectedComponent} = props;
  const {descriptor} = componentConfig;
  const {allowChildren} = descriptor ? descriptor : {};
  const Component = componentConfig.state && componentConfig.state === "new" ? forkedRepository[componentConfig.name] : repository[componentConfig.name];
  const {registerListener} = useEventHandler();
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
    ref && ref.current && registerListener(ref.current);
  }, [preview]);

  // Use this component for dropping other items
  const [, drop] = useDrop({
    accept: [ITEM_TYPE.ARMAMENT, ITEM_TYPE.ARMAMENT_WRAPPER],
    hover: (item, monitor) => {
//       console.log(item)
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
    drop: (item, monitor) => dndUtil.armWrapperDropHandler(item, monitor, ref, componentsConfig, componentConfig, setComponentsConfig, setSelectedComponent, dispatchClearPropsState)
    // dispatchComponentsConfig,
    // setSelectedComponent, dispatchClearPropsState, dispatchModal, armory
  })
  drag(drop(ref))
  
  // // Below line should always render child items of type Component and not HTML elements
  // const children = allowChildren && descriptor && descriptor.children && recursiveRenderer(descriptor.children)

  return (
    selectedComponent === componentConfig.uuid ? 
    <div
      className="SelectionIndicator position-absolute"
      style={{
        top: componentConfig.top,
        left: componentConfig.left,
        opacity: isDragging ? 0 : 1
      }}>
      <span /><span /><span /><span />
      <div
        className="c-ArmamentWrapper"
        id={`${componentConfig.uuid}-RENDER`}
        ref={ref}
        style={{
          cursor: "move"
        }}
        onClick={(e) => {
          setSelectedComponent(componentConfig.uuid);
          e.stopPropagation();
        }}>
          {Component && <Component allowChildren={allowChildren} {...componentConfig} />}
      </div>
    </div>
    : <div
        className="c-ArmamentWrapper position-absolute"
        id={`${componentConfig.uuid}-RENDER`}
        ref={ref}
        style={{
          opacity: isDragging ? 0 : 1,
          cursor: "move",
          top: componentConfig.top,
          left: componentConfig.left
        }}
        onClick={(e) => {
          setSelectedComponent(componentConfig.uuid);
          e.stopPropagation();
        }}>
          {Component && <Component allowChildren={allowChildren} {...componentConfig} />}
      </div>
  );
};

ArmamentWrapper.propTypes = {
  componentConfig: PropTypes.object,
  recursiveRenderer: PropTypes.func,
  setSelectedComponent: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  // armory: getArmory,
  componentsConfig: getPresentComponentsConfig,
  // layout: getLayout,
  // previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchClearPropsState,
  setComponentsConfig
}

export default memo(connect(mapStateToProps, mapDispatchToProps)(ArmamentWrapper));