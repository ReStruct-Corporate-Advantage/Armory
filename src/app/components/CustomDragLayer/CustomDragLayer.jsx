/**
 *
 * CustomDragLayer works by creating a wrapper over the dragged component. This wrapper takes entire screen width.
 * When element is dragged, the wrapper gets dragged (translated - below) by dragged mouse pixels giving impression of the element getting dragged
 *
 */
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useDragLayer } from "react-dnd";
import { createPropsSelector } from "reselect-immutable-helpers";
import * as $ from "jquery";
import { getToggles } from "../../global-selectors";
import { getLayout } from "../../pages/ComponentCreator/selectors";
import {
  forkedRepository,
  repository,
} from "../../utils/CodeUtils/ComponentGenerator";
import { ITEM_TYPE } from "../../constants/types";

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

const CustomDragLayer = (props) => {
  const { clientRect, getItemStyles, layout, toggles } = props;
  const snapToggle =
    toggles && toggles.find((toggle) => toggle.name === "toggleComponentSnap");
  const isSnapToGrid = snapToggle && snapToggle.selected;
  let dragged, bounds = clientRect;
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    initialClientOffset,
    clientOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));
  switch (itemType) {
    case ITEM_TYPE.ARMAMENT:
      const Armament = repository[item.category.name];
      dragged = Armament ? <Armament {...item.category} /> : null;
      break;
    case ITEM_TYPE.ARMAMENT_WRAPPER:
      const ArmamentWrapper = forkedRepository[item.category.uuid];
      try {
        const container = $(`#${item.category.uuid}-RENDER`).parent().closest(".c-ArmamentWrapper")[0];
        bounds = container.getBoundingClientRect();
      } catch {
        bounds = clientRect;
      }
      dragged = ArmamentWrapper ? ArmamentWrapper : null;
      break;
    default:
      dragged = null;
  }
  if (!isDragging) {
    return null;
  }
  return (
    <div className="c-CustomDragLayer" style={layerStyles}>
      <div
        style={getItemStyles({
          initialOffset,
          initialClientOffset,
          clientOffset,
          clientRect: bounds,
          layout,
          isSnapToGrid,
          isInstanceComponent: itemType === ITEM_TYPE.ARMAMENT_WRAPPER
        })}
      >
        {dragged}
      </div>
    </div>
  );
};

CustomDragLayer.props = {
  clientRect: PropTypes.object,
  containingParentRef: PropTypes.object,
  layout: PropTypes.string,
};

const mapStateToProps = createPropsSelector({
  layout: getLayout,
  toggles: getToggles,
});

export default connect(mapStateToProps)(CustomDragLayer);
