import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useDrop } from "react-dnd";
import { useResizeDetector } from "react-resize-detector";
import { dispatchClearPropsState, dispatchComponentsConfig, dispatchHistory, dispatchPreviousLayout, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import { dispatchModal } from "../../global-actions";
import { getPresentComponentsConfig, getLayout, getPreviousLayout, getArmory } from "../../pages/ComponentCreator/selectors";
import {LayoutSelector} from "../";
import dndUtil from "../../utils/dndUtil";
import {ITEM_TYPE} from "../../constants/types";
import "./ComponentContainer.component.scss";
import { compGen } from "../../utils/CodeUtils/ComponentGenerator";

const ComponentContainer = props => {
  const {armory, componentsConfig, boundingClientRectProvider, dispatchClearPropsState, dispatchComponentsConfig, dispatchModal, selectedComponent, setSelectedComponent, setComponentsConfig} = props;
  const { width, height, ref } = useResizeDetector();
  const comContainerRef = useRef();
  const [cells, setCells] = useState([]);

  useEffect(() => {
    const layout = props.layout || 30;
    const elemInner = comContainerRef.current;
    const {width, height, left, top} = elemInner.getBoundingClientRect();
    boundingClientRectProvider({width, height, left, top});
    let horizontalCellCount = Math.floor(width / layout);
    let verticalCellCount = Math.floor(height / layout);
    const cellsRenew = [];
    for (var i = 0; i < verticalCellCount; i++) {
      for (var j = 0; j < horizontalCellCount; j++) {
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
  }, [props.layout, height, width, boundingClientRectProvider]);

  // eslint-disable-next-line no-unused-vars
  const [{isOver}, drop] = useDrop({
    accept: [ITEM_TYPE.ARMAMENT, ITEM_TYPE.ARMAMENT_WRAPPER],
    drop: (item, monitor) => {
      dndUtil.dropHandler(item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, setComponentsConfig,
      setSelectedComponent, dispatchClearPropsState, dispatchModal, armory)
      },
    collect: monitor => ({isOver: !!monitor.isOver()}),
  })

  const cellRenders = cells && cells.length > 0 && cells.map((cell, key) => <span key={key} className="position-absolute" style={cell} />);
  const items = componentsConfig.components[0].descriptor.children;
  if (!comContainerRef) {
    debugger;
  }
  const componentRenders = compGen.iterateAndGenerateWithConfig(items, selectedComponent, setSelectedComponent, comContainerRef).map(componentObj => componentObj.item);
  // const componentRenderer = (items) => items.map((componentConfig, key) => componentConfig.indent !== 0 && <ArmamentWrapper selectedComponent={selectedComponent}
  //         setSelectedComponent={setSelectedComponent} key={key} componentConfig={componentConfig} recursiveRenderer={componentRenderer} />)
  //         .filter(component => component);

  return (
    <div className="c-ComponentContainer h-100 position-relative" ref={comContainerRef} >
      <LayoutSelector />
      <div className="c-ComponentContainer__layout h-100 position-relative" ref={ref}>
        {cellRenders}
      </div>
      <div className="c-ComponentContainer__renders position-absolute w-100 h-100" ref={drop}>
        {componentRenders}
      </div>
    </div>
  );
};

ComponentContainer.propTypes = {
  armory: PropTypes.array,
  componentsConfig: PropTypes.object,
  boundingClientRectProvider: PropTypes.func,
  dispatchClearPropsState: PropTypes.func,
  dispatchComponentsConfig: PropTypes.func,
  dispatchHistory: PropTypes.func,
  dispatchModal: PropTypes.func,
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string,
  previousLayout: PropTypes.string,
  setSelectedComponent: PropTypes.func,
  setComponentsConfig: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  armory: getArmory,
  componentsConfig: getPresentComponentsConfig,
  layout: getLayout,
  previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchClearPropsState,
  dispatchComponentsConfig,
  dispatchHistory,
  dispatchModal,
  dispatchPreviousLayout,
  setComponentsConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentContainer);