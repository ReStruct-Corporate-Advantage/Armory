import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useDrop } from "react-dnd";
import { dispatchComponentsConfig, dispatchPreviousLayout } from "../../pages/ComponentCreator/actions";
import { getComponentsConfig, getLayout, getPreviousLayout } from "../../pages/ComponentCreator/selectors";
import {ArmamentWrapper, LayoutSelector} from "../";
import DNDUtil from "../../utils/dndUtil";
import ITEM_TYPES from "../../constants/types";
import "./ComponentContainer.component.scss";

const ComponentContainer = props => {
  const {componentsConfig, dispatchComponentsConfig} = props;
  const comContainerRef = useRef();
  const [cells, setCells] = useState([]);
  const elem = comContainerRef.current;
  const [dimensions, setDimensions] = useState({ 
    height: elem ? elem.offsetHeight : 0,
    width: elem ? elem.offsetWidth : 0
  })

  useEffect(() => {
    const layout = props.layout || 30;
    const elemInner = comContainerRef.current;
    const {width, height, left, top} = elemInner.getBoundingClientRect();
    let horizontalCellCount = Math.floor(width / layout);
    let verticalCellCount = Math.floor(height / layout);
    const cellsRenew = []
    if (elemInner && elemInner.getAttribute('listener') !== 'true') {
      elemInner.addEventListener('resize', () => {
        console.log(dimensions);
        setDimensions({
          height: elemInner.offsetHeight,
          width: elemInner.offsetWidth
        })
      })
    }
    for (var i = 0; i < verticalCellCount; i++) {
      for (var j = 0; j <= horizontalCellCount; j++) {
        cellsRenew.push(
          {
            top: (i * layout),
            left: (j * layout),
            width: layout,
            height: layout,
            borderTop: "1px solid darkgrey",
            borderRight: j === horizontalCellCount - 1 ? "1px solid darkgrey" : "none",
            borderBottom: i === verticalCellCount - 1 ? "1px solid darkgrey" : "none",
            borderLeft: "1px solid darkgrey",
          })
      }
    }
    setCells(cellsRenew);
    // updateLayout
  }, [props.layout, dimensions.height, dimensions.width]);

  const [{isOver}, drop] = useDrop({
    accept: [ITEM_TYPES.ARMAMENT, ITEM_TYPES.ARMAMENT_WRAPPER],
    drop: (item, monitor) => DNDUtil.dragHanlder(item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig),
    collect: monitor => ({isOver: !!monitor.isOver()}),
  })

  const cellRenders = cells && cells.length > 0 && cells.map(cell => <span className="position-absolute" style={cell} />);
  const componentRenders = componentsConfig.components.map(componentConfig => <ArmamentWrapper componentConfig={componentConfig} />);

  return (
    <div className="c-ComponentContainer h-100 position-relative" ref={comContainerRef} >
      <LayoutSelector />
      <div className="c-ComponentContainer__layout h-100 position-relative">
        {cellRenders}
      </div>
      <div className="c-ComponentContainer__renders position-absolute w-100 h-100" ref={drop}>
        {componentRenders}
      </div>
    </div>
  );
};

ComponentContainer.propTypes = {
  componentsConfig: PropTypes.object,
  dispatchComponentsConfig: PropTypes.func,
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string,
  previousLayout: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getComponentsConfig,
  layout: getLayout,
  previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchComponentsConfig,
  dispatchPreviousLayout
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentContainer);