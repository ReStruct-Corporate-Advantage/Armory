import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useDrop } from "react-dnd";
import { useResizeDetector } from "react-resize-detector";
// import * as monaco from "monaco-editor";

import { dispatchClearPropsState, dispatchComponentsConfig, dispatchHistory, dispatchPreviousLayout, setComponentsConfig } from "../../pages/ComponentCreator/actions";
import { dispatchLevels, dispatchModal } from "../../global-actions";
import { getToggles, getUserDetails, getZoom } from "../../global-selectors";
import { getPresentComponentsConfig, getLayout, getPreviousLayout, getArmory } from "../../pages/ComponentCreator/selectors";
import useLogger from "../../hooks/useLogger";
import dndUtil from "../../utils/dndUtil";
import { compGen } from "../../utils/CodeUtils/ComponentGenerator";
import {ITEM_TYPE} from "../../constants/types";
import "./ComponentContainer.component.scss";

const ComponentContainer = props => {
  const {armory, componentsConfig, boundingClientRectProvider, dispatchClearPropsState, dispatchComponentsConfig, dispatchLevels,
    dispatchModal, selectedComponent, dispatchSelectedComponent, socket, toggles, userDetails, zoom} = props;
  const developerToggle = toggles && toggles.find(toggle => toggle.name === "developerMode");
  const isDevMode = developerToggle && developerToggle.selected;
  const { width, height, ref } = useResizeDetector();
  const comContainerRef = useRef();
  const [cells, setCells] = useState([]);
  const {logger} = useLogger();

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
    // TODO VS Code's Monaco Code Editor
    // const elem = document.getElementsByClassName("c-ComponentContainer")[0]
    // elem && monaco.editor.create(elem, {
    //   value: "function hello() {\n\talert('Hello world!');\n}",
    //   language: "javascript"
    // });
    // updateLayout
  }, [props.layout, height, width, boundingClientRectProvider]);

  useEffect(() => {
    const target = comContainerRef.current;
    if (target) {
      // const scale = target.getBoundingClientRect().width / target.offsetWidth;
      let zoomValue = zoom/100;
      zoomValue = zoomValue < 0.5 ? 0.5 : zoomValue;
      const scaleValue = `scale(${zoom ? zoomValue : 1})`
      target.style.transformOrigin = "100px 100px";
      target.style.transform = scaleValue;
    }
  }, [zoom])

  // eslint-disable-next-line no-unused-vars
  const [{isOver}, drop] = useDrop({
    accept: [ITEM_TYPE.ARMAMENT, ITEM_TYPE.ARMAMENT_WRAPPER],
    drop: (item, monitor) => {
      dndUtil.dropHandler(item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig,
        dispatchSelectedComponent, dispatchClearPropsState, dispatchModal, armory, dispatchLevels, userDetails, socket, logger)
    },
    collect: monitor => ({isOver: !!monitor.isOver()}),
  })

  const cellRenders = cells && cells.length > 0 && cells.map((cell, key) => <span key={key} className="position-absolute" style={cell} />);
  const items = componentsConfig.components[0].descriptor.children;
  const componentRenders = compGen.iterateAndGenerateWithConfig(items, comContainerRef, "", selectedComponent, dispatchSelectedComponent, socket).map(componentObj => componentObj.item);

  const touchHandler = e => {
    if (e.altKey && comContainerRef.current) {
      e.stopPropagation();
      const target = comContainerRef.current;
      const scale = target.getBoundingClientRect().width / target.offsetWidth;
      if (e.deltaY < 0 && scale > 0.5) {
        target.style.transformOrigin = "100px 100px";
        target.style.transform = `scale(${scale - (4/100*scale)})`;
      } else if (e.deltaY > 0 && scale < 1) {
        let newScale = scale + (4/100*scale);
        newScale = newScale > 1 ? 1 : newScale
        target.style.transformOrigin = "100px 100px";
        target.style.transform = `scale(${newScale})`;
      }
    }
  }

  return (
    <div className="c-ComponentContainer position-relative" ref={comContainerRef} onWheel={touchHandler}>
      {isDevMode && <div className="c-ComponentContainer__layout h-100 position-relative" ref={ref}>
        {cellRenders}
      </div>}
      <div className="c-ComponentContainer__renders position-absolute" ref={drop}>
        {componentRenders.length > 0 ? componentRenders : <h1 className="drop-zone-msg" style={{fontFamily: "monospace"}}>Drop Zone!</h1>}
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
  dispatchSelectedComponent: PropTypes.func,
  setComponentsConfig: PropTypes.func,
  zoom: PropTypes.number
};

const mapStateToProps = createPropsSelector({
  armory: getArmory,
  componentsConfig: getPresentComponentsConfig,
  layout: getLayout,
  previousLayout: getPreviousLayout,
  toggles: getToggles,
  userDetails: getUserDetails,
  zoom: getZoom
})


const mapDispatchToProps = {
  dispatchClearPropsState,
  dispatchComponentsConfig,
  dispatchHistory,
  dispatchLevels,
  dispatchModal,
  dispatchPreviousLayout,
  setComponentsConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentContainer);