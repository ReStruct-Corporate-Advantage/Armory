import {ITEM_TYPE} from "../constants/types";

export class DNDUtil {

  constructor () {
    this.uuid = 1;
  }

  dropHandler (item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, setSelectedComponent) {
      this.updatePositionDescriptor(item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, setSelectedComponent)
  }

  updatePositionDescriptor (item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, setSelectedComponent) {
    let componentsConfigClone;
    const {left: containerLeft, top: containerTop} = comContainerRef.current.getBoundingClientRect();
    const {x, y} = monitor.getClientOffset();
    let left = Math.round(x - containerLeft);
    let top = Math.round(y - containerTop);
    componentsConfigClone = {...componentsConfig};
    const componentsRoot = [...componentsConfigClone.components];
    componentsConfigClone.components = componentsRoot;
    const rootChildrenArray = componentsRoot[0].descriptor.children;
    [left, top] = DNDUtil.snapToGrid(left, top);

    if (item.type === ITEM_TYPE.ARMAMENT) {
      componentsConfigClone.count = componentsConfigClone.count + 1;
      item.category.uuid = `arm-${item.category.componentName}-${this.uuid++}`;
      const droppedComponentConfig = {name: item.category.componentName, index: componentsConfigClone.count, top, left, ...item.category}
      rootChildrenArray.push(droppedComponentConfig);
    } else {
      item.category.top = top;
      item.category.left = left;
    }
    dispatchComponentsConfig(componentsConfigClone);
    setSelectedComponent(item.category.uuid)
  }

  dragHandler () {

  }

  collector (monitor) {
      return {isOver: !!monitor.isOver()}
  }

  static snapToGrid(x, y, layout) {
    layout = layout || 30;
    const snappedX = Math.floor(x / layout) * layout
    const snappedY = Math.floor(y / layout) * layout
    return [snappedX, snappedY]
  }

  static correctError (clientRect, offset, x, y, layout) {
    layout = layout || 30;
    const {top, left} = clientRect;
    const {x: offsetX, y: offsetY} = offset;
    const xCorrection = (left - x - offsetX) % layout;
    const yCorrection = (top - y - offsetY) % layout;
    return [x + xCorrection, y + yCorrection];
  }

  static hoverInPrimaryContainer (clientRect, clientOffset) {
    if (!clientRect || !clientOffset) return false;
    const {left, top, width, height} = clientRect;
    const {x, y} = clientOffset;
    return x > left && x < left + width
      && y > top && y < top + height;
  }
  
}

export default new DNDUtil();