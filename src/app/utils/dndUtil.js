import {ITEM_TYPE} from "../constants/types";
import Helper from "./Helper";

export class DNDUtil {

  constructor () {
    this.uuid = 1;
  }

  dropHandler (item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig, setComponentsConfig, setSelectedComponent, dispatchClearPropsState, dispatchModal, armory) {
    if (monitor.isOver()){
      const rootChildrenArray = componentsConfig.components[0].descriptor.children;
      const position = this.getPosition(comContainerRef, monitor);
      if (rootChildrenArray.length === 0) {
        // console.log(monitor)
        dispatchModal({display: true, meta: {title: "Add Container?", primaryButtonText: "Add", secondaryButtonText: "Cancel",
          body: "Clicking on add will wrap your component with a container, cancel to just view/fork/edit the component",
          primaryHandler: () => this.wrapAndUpdate(item, position, componentsConfig, dispatchComponentsConfig, setSelectedComponent, dispatchClearPropsState, armory),
          secondaryHandler: () => this.updatePositionDescriptor(item, position, componentsConfig, dispatchComponentsConfig, setSelectedComponent, dispatchClearPropsState)}});
      } else {
        this.updatePositionDescriptor(item, position, componentsConfig, setComponentsConfig, setSelectedComponent, dispatchClearPropsState);
      }
    }
  }

  wrapAndUpdate (item, position, componentsConfig, dispatchComponentsConfig, setSelectedComponent, dispatchClearPropsState, armory) {
    const [left, top] = position;
    const componentsConfigClone = {...componentsConfig};
    const rootChildrenArray = componentsConfigClone.components[0].descriptor.children;
    let {selectedComponentConfig: container} = Helper.searchInTree("componentName", "Container", armory, "", "items.descriptor", 1)
    container = {...container};
    container.descriptor = {...container.descriptor};
    container.descriptor.children = [...container.descriptor.children];
    componentsConfigClone.count = componentsConfigClone.count + 1;
    container.uuid = `arm-${container.componentName}-${this.uuid++}`;
    componentsConfigClone.count = componentsConfigClone.count + 1;
    item.category.uuid = `arm-${item.category.componentName}-${this.uuid++}`;
    container.descriptor.children = container.descriptor.children ? [...container.descriptor.children] : [];
    const containerComponentConfig = {name: container.componentName, index: componentsConfigClone.count, top, left, ...container}
    const droppedComponentConfig = {name: item.category.componentName, index: componentsConfigClone.count, top: 0, left: 0, ...item.category}
    rootChildrenArray.push(containerComponentConfig);
    container.descriptor.children.push(JSON.parse(JSON.stringify(droppedComponentConfig)));
    dispatchComponentsConfig(componentsConfigClone);
    setSelectedComponent(item.category.uuid)
    dispatchClearPropsState(true);
  }

  updatePositionDescriptor (item, position, componentsConfig, setComponentsConfig, setSelectedComponent, dispatchClearPropsState) {
    const componentsConfigClone = {...componentsConfig};
    const rootChildrenArray = componentsConfigClone.components[0].descriptor.children;
    const [left, top] = position;

    if (item.type === ITEM_TYPE.ARMAMENT) {
      componentsConfigClone.count = componentsConfigClone.count + 1;
      item.category.uuid = `arm-${item.category.componentName}-${this.uuid++}`;
      const droppedComponentConfig = {name: item.category.componentName, index: componentsConfigClone.count, top, left, ...item.category}
      rootChildrenArray.push(JSON.parse(JSON.stringify(droppedComponentConfig)));
    } else {
      const {parent: droppedComponentParent, selectedComponentConfig: droppedComponentConfig} = Helper.searchInTree("uuid", item.category.uuid, componentsConfigClone, "components", "descriptor.children") || {};
      item.category.top = top;
      item.category.left = left;
      droppedComponentParent && droppedComponentParent.splice(droppedComponentParent.indexOf(droppedComponentConfig), 1)
      droppedComponentConfig && rootChildrenArray.push(droppedComponentConfig);
    }
    setComponentsConfig(componentsConfigClone);
    setSelectedComponent(item.category.uuid)
    dispatchClearPropsState(true);
  }

  armWrapperDropHandler (item, monitor, comContainerRef, ref, componentsConfig, droppedOn, setComponentsConfig, setSelectedComponent, dispatchClearPropsState) {
    if (monitor.isOver()){
      if (item.category.uuid === droppedOn.uuid) {
        const position = this.getPosition(comContainerRef, monitor);
        this.updatePositionDescriptor(item, position, componentsConfig, setComponentsConfig, setSelectedComponent, dispatchClearPropsState);
      } else if (droppedOn.descriptor.allowChildren) {
        const componentsConfigClone = {...componentsConfig};
        const {selectedComponentConfig: wrapper} = Helper.searchInTree("uuid", droppedOn.uuid, componentsConfigClone, "components", "descriptor.children");
        const wrapperChildrenArray = wrapper && wrapper.descriptor.children;
        const [left, top] = this.getPosition(ref, monitor);

        if (item.type === ITEM_TYPE.ARMAMENT) {
          componentsConfigClone.count = componentsConfigClone.count + 1;
          item.category.uuid = `arm-${item.category.componentName}-${this.uuid++}`;
          const droppedComponentConfig = {name: item.category.componentName, index: componentsConfigClone.count, top, left, ...item.category}
          wrapperChildrenArray.push(droppedComponentConfig);
        } else {
          const {parent: droppedComponentParent, selectedComponentConfig: droppedComponentConfig} = Helper.searchInTree("uuid", item.category.uuid, componentsConfigClone, "components", "descriptor.children");
          item.category.top = top;
          item.category.left = left;
          droppedComponentParent && droppedComponentParent.splice(droppedComponentParent.indexOf(droppedComponentConfig), 1)
          wrapperChildrenArray.push(droppedComponentConfig);
        }
        setComponentsConfig(componentsConfigClone);
        setSelectedComponent(item.category.uuid)
        dispatchClearPropsState(true);
      }
    }
  }

  getPosition (comContainerRef, monitor) {
    const {left: containerLeft, top: containerTop} = comContainerRef.current.getBoundingClientRect();
    const {x, y} = monitor.getClientOffset();
    let left = Math.round(x - containerLeft);
    let top = Math.round(y - containerTop);
    return DNDUtil.snapToGrid(left, top);
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