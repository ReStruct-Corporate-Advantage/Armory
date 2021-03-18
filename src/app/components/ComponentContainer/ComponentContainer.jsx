import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createPropsSelector } from "reselect-immutable-helpers";
import { useDrop } from "react-dnd";
import { dispatchPreviousLayout } from "../../pages/Home/actions";
import { getLayout, getPreviousLayout } from "../../pages/Home/selectors";
import {LayoutSelector} from "../";
import {ArmamentWrapper} from "./../";
import "./ComponentContainer.component.scss";
import ITEM_TYPES from "../../constants/types";

const ComponentContainer = props => {

  const comContainerRef = useRef();
  const [cells, setCells] = useState([]);
  const [componentsConfig, updateComponentsConfig] = useState({
    boardId: 1,
    count: 0,
    components: []
  });

  useEffect(() => {
    const layout = props.layout || 30;
    const {width, height, left, top} = comContainerRef.current.getBoundingClientRect();
    let horizontalCellCount = Math.floor(width / layout);
    let verticalCellCount = Math.floor(height / layout);
    const cellsRenew = []
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
  }, [props.layout]);

  const [{isOver}, drop] = useDrop({
    accept: [ITEM_TYPES.ARMAMENT, ITEM_TYPES.ARMAMENT_WRAPPER],
    drop: (item, monitor) => {
      let componentsConfigClone;
      const {left, top} = comContainerRef.current.getBoundingClientRect();
      const dropCoords = monitor.getClientOffset();
      componentsConfigClone = {...componentsConfig};
      const componentsClone = [...componentsConfigClone.components];
      componentsConfigClone.components = componentsClone;
      if (item.type === ITEM_TYPES.ARMAMENT) {
        componentsConfigClone.count = componentsConfigClone.count + 1;
        componentsClone.push({name: item.category.componentName, index: componentsConfigClone.count, top: dropCoords.y - top, left: dropCoords.x - left})
      } else {
        componentsClone.splice(componentsClone.indexOf(item.category), 1)
        componentsClone.push({name: item.category.name, index: item.index, top: dropCoords.y - top, left: dropCoords.x - left})
      }
      updateComponentsConfig(componentsConfigClone);
      // if (id !== item.listId) {
      //   // pushCard(item.card);
      // }
      // return {listId: id}
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    }),
  })

  const cellRenders = cells && cells.length > 0 && cells.map(cell => <span className="position-absolute" style={cell} />);
  const componentRenders = componentsConfig.components.map(componentConfig => <ArmamentWrapper componentConfig={componentConfig} />);

  return (
    <div className="c-ComponentContainer h-100 position-relative" ref={comContainerRef}>
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
  dispatchPreviousLayout: PropTypes.func,
  layout: PropTypes.string,
  previousLayout: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  layout: getLayout,
  previousLayout: getPreviousLayout
})

const mapDispatchToProps = {
  dispatchPreviousLayout
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentContainer);