import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useDragLayer } from "react-dnd";
import { createPropsSelector } from "reselect-immutable-helpers";
import { getLayout } from "../../pages/ComponentCreator/selectors";
import {DNDUtil} from "../../utils/dndUtil";
import {ITEM_TYPE} from "./../../constants/types";
import * as components from "../repository";

const layerStyles = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 100,
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};
function getItemStyles(initialOffset, clientOffset, clientRect, layout, isSnapToGrid) {
    if (!DNDUtil.hoverInPrimaryContainer(clientRect, clientOffset)) {
        return {
            display: "none",
        };
    }
    let { x, y } = clientOffset;
    if (isSnapToGrid) {
        x -= initialOffset.x;
        y -= initialOffset.y;
        [x, y] = DNDUtil.snapToGrid(x, y, layout);
        [x, y] = DNDUtil.correctError(clientRect, initialOffset, x, y, layout)
        x += initialOffset.x;
        y += initialOffset.y;
    }
    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

const CustomDragLayer = (props) => {
  const {clientRect, layout} = props
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
          const Component = components[item.category.componentName]
            return Component ? <Component {...item.category} /> : null;
        default:
            return null;
    }
  }
  if (!isDragging) {
      return null;
  }
  return <div className="c-CustomDragLayer" style={layerStyles}>
    <div style={getItemStyles(initialOffset, clientOffset, clientRect, layout, true)}>
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
