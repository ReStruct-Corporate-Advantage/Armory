import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useDrop } from "react-dnd";
import { dispatchComponentsConfig, dispatchHistory, dispatchPreviousLayout } from "../../pages/ComponentCreator/actions";
import { getPresentComponentsConfig, getLayout, getPreviousLayout } from "../../pages/ComponentCreator/selectors";
import {ArmamentWrapper, LayoutSelector} from "../";
import dndUtil from "../../utils/dndUtil";
import DescriptorGenerator from "../../utils/DescriptorGenerator";
import {ITEM_TYPE} from "../../constants/types";
import "./ComponentContainer.component.scss";

const ComponentContainer = props => {
  const {componentsConfig, boundingClientRectProvider, dispatchComponentsConfig, dispatchHistory} = props;
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
    boundingClientRectProvider({width, height, left, top});
    DescriptorGenerator.generate();
    let horizontalCellCount = Math.floor(width / layout);
    let verticalCellCount = Math.floor(height / layout);
    const cellsRenew = []
    // TODO fix this not working code to resize container
    if (elemInner && elemInner.getAttribute("listener") !== "true") {
      elemInner.addEventListener("resize", () => {
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
  }, [props.layout, dimensions.height, dimensions.width, boundingClientRectProvider, dimensions]);

  // eslint-disable-next-line no-unused-vars
  const [{isOver}, drop] = useDrop({
    accept: [ITEM_TYPE.ARMAMENT, ITEM_TYPE.ARMAMENT_WRAPPER],
    drop: (item, monitor) => dndUtil.dropHandler(item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, dispatchHistory),
    collect: monitor => ({isOver: !!monitor.isOver()}),
  })

  const cellRenders = cells && cells.length > 0 && cells.map((cell, key) => <span key={key} className="position-absolute" style={cell} />);
  const componentRenders = componentsConfig.components[0].descriptor.children
                  .map((componentConfig, key) => componentConfig.indent !== 0 && <ArmamentWrapper key={key} componentConfig={componentConfig} />)
                  .filter(component => component);

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
  boundingClientRectProvider: PropTypes.func,
  dispatchComponentsConfig: PropTypes.func,
  dispatchHistory: PropTypes.func,
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string,
  previousLayout: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig,
  layout: getLayout,
  previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchHistory,
  dispatchComponentsConfig,
  dispatchPreviousLayout
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentContainer);