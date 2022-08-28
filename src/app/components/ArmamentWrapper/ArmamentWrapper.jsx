import React, { memo, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { useDrag, useDrop } from "react-dnd";
import {getEmptyImage} from "react-dnd-html5-backend";
import { getPresentComponentsConfig } from "../../pages/ComponentCreator/selectors";
import { dispatchClearPropsState, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import useEventHandler from "../../hooks/useEventHandler";
import dndUtil from "../../utils/DND/dndUtil";
import {ITEM_TYPE} from "../../constants/types";
import Helper from "../../utils/Helper";
import StyleAggregator from "../../utils/CodeUtils/StyleAggregator";
import "./ArmamentWrapper.component.scss";

const ArmamentWrapper = props => {
  const {children, comContainerRef, componentConfig, componentsConfig, setComponentsConfig, dispatchClearPropsState, selectedComponent, dispatchSelectedComponent, socket} = props;
  const {descriptor} = componentConfig || {};
  const {allowChildren} = descriptor || {};
  // const Component = componentConfig.state && componentConfig.state === "new" ? forkedRepository[componentConfig.name] : repository[componentConfig.name];
  const Component = children;
  const ref = useRef(null);
  let {registerListener} = useEventHandler();
  registerListener = useCallback(registerListener, [ref.current, registerListener]);

  // Use this component to be dragged and dropped on other potential drop targets
  const [{isDragging}, drag, preview] = useDrag({
    type: ITEM_TYPE.ARMAMENT_WRAPPER,
    item: {index: componentConfig.index, category: componentConfig},
		collect: monitor => ({
      isDragging: !!monitor.isDragging()
		}),
    being: () => {
      console.log("Being drag");
    },
    end: () => {
      console.log("End drag");
    }
  })
  
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
    ref && ref.current && registerListener(ref.current);
  }, [preview, registerListener]);

  // Use this component for dropping other items
  const [, drop] = useDrop({
    accept: [ITEM_TYPE.ARMAMENT, ITEM_TYPE.ARMAMENT_WRAPPER],
    hover: (item, monitor) => {
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
      item.index = hoverIndex
    },
    drop: (item, monitor) => {
      dndUtil.armWrapperDropHandler(item, monitor, comContainerRef, ref, componentsConfig, componentConfig, setComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket)
    }
  })
  drag(drop(ref))
  
  // // Below line should always render child items of type Component and not HTML elements
  // const children = allowChildren && descriptor && descriptor.children && recursiveRenderer(descriptor.children)

  const wrapperStyles = {};
  const aggregatedStyles = StyleAggregator.aggregateStyles([descriptor.styles, {height: descriptor.defaultHeight, width: descriptor.defaultWidth}]);
  descriptor && descriptor.wrapperStyles && Object.keys(aggregatedStyles).forEach(key => {
    if (descriptor.wrapperStyles.indexOf(key) > -1) {
      const defaultKey = Helper.getDefaultKey(key);
      const wrapperStyle = descriptor.styles[key] || descriptor[defaultKey];
      if (wrapperStyle) {
        wrapperStyles[key] = wrapperStyle;
      }
    }
  })
  return <div
      className={`c-ArmamentWrapper position-absolute${selectedComponent === componentConfig.uuid ? " SelectionIndicator" : ""}`}
      id={`${componentConfig.uuid}-RENDER`}
      ref={ref}
      role="presentation"
      style={{
        opacity: isDragging ? 0 : 1,
        cursor: "move",
        top: componentConfig.top,
        left: componentConfig.left,
        ...wrapperStyles
      }}
      onClick={(e) => {
        dispatchSelectedComponent(componentConfig.uuid);
        e.stopPropagation();
      }} onKeyDown={() => {}}>
        {selectedComponent === componentConfig.uuid &&
          <><span className="selection-indicator" />
          <span className="selection-indicator" />
          <span className="selection-indicator" />
          <span className="selection-indicator" /></>
        }
        {Component && <Component allowChildren={allowChildren} {...componentConfig} />}
    </div>
};

ArmamentWrapper.propTypes = {
  componentConfig: PropTypes.object,
  recursiveRenderer: PropTypes.func,
  dispatchSelectedComponent: PropTypes.func
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