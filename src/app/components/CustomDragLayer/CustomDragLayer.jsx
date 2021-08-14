import { useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useDragLayer } from "react-dnd";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getLayout } from "../../pages/ComponentCreator/selectors";
import { DNDUtil } from "../../utils/dndUtil";
import { forkedRepository, repository } from "./../../utils/CodeUtils/ComponentGenerator";
import { ITEM_TYPE } from "./../../constants/types";
// import * as components from "../repository";

const layerStyles = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  color: "black",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};
function getItemStyles(initialOffset, clientOffset, clientRect, layout, isSnapToGrid, isInstanceComponent, ref) {
  if (!DNDUtil.hoverInPrimaryContainer(clientRect, clientOffset)) {
    return {
      display: "none",
    };
  }
  let { x, y } = clientOffset;
  if (isSnapToGrid) {
    // x and y is the cursor position in window, below we calculate cursor position w.r.t. component container
    // We subtract before and add back container offsets after snapping as we want snapping w.r.t. component container,
    // without this snapping occurrs w.r.t. window left and top causing an error of 0 to current set grid cell dimensions (default 30 px)
    x -= clientRect.left;
    y -= clientRect.top;
    // Snap and update x and y distances
    [x, y] = DNDUtil.snapToGrid(x, y, layout);
    // Add back component container offsets
    x += clientRect.left;
    y += clientRect.top;
  }

  if (isInstanceComponent) {
    const draggedItem = ref.current;
    const {x: draggedX, y: draggedY, top, left} = draggedItem ? draggedItem.getBoundingClientRect() : {};
    // console.log(draggedX)
    // console.log(draggedY)
    // console.log(top)
    // console.log(left)
    console.log(clientOffset.x - left)
    console.log(clientOffset.y - top)
    // x = clientOffset.x - initialOffset.x + 310 + 64 - clientRect.left - (clientOffset.x - left);
    // y = clientOffset.y - initialOffset.y + 20 + 64 - clientRect.top - (clientOffset.y - top);
    x = clientOffset.x - initialOffset.x + 310 + 64 - clientRect.left;
    y = clientOffset.y - initialOffset.y + 20 + 64 - clientRect.top;
    [x, y] = DNDUtil.snapToGrid(x, y, layout);
    x += clientRect.left;
    y += clientRect.top;
//     console.log(x, y);
//     console.log(ref.current)
//     console.log(ref.current && ref.current.getBoundingClientRect());
  }
  
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

const CustomDragLayer = (props) => {
  const { clientRect, layout } = props
  const dragPreview = useRef(null);
  const { itemType, isDragging, item, initialOffset, clientOffset, } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    clientOffset: monitor.getClientOffset(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));
  function renderItem() {
    switch (itemType) {
      case ITEM_TYPE.ARMAMENT:
        const Armament = repository[item.category.componentName];
        return Armament ? <Armament {...item.category} /> : null;
      case ITEM_TYPE.ARMAMENT_WRAPPER:
        const ArmamentWrapper = forkedRepository[item.category.uuid];
        return ArmamentWrapper ? ArmamentWrapper : null;
      default:
        return null;
    }
  }
  if (!isDragging) {
    return null;
  }
  return <div className="c-CustomDragLayer" style={layerStyles}>
    <div style={getItemStyles(initialOffset, clientOffset, clientRect, layout, true, itemType === ITEM_TYPE.ARMAMENT_WRAPPER, dragPreview)} ref={dragPreview}>
      {renderItem()}
    </div>
  </div>;
};

CustomDragLayer.props = {
  clientRect: PropTypes.object,
  layout: PropTypes.string
}


const mapStateToProps = createPropsSelector({
  layout: getLayout
})

export default connect(mapStateToProps)(CustomDragLayer);
