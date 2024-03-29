import {v4 as uuid} from "uuid";
import {ITEM_TYPE} from "../../constants/types";
import Helper from "../Helper";

export class DNDUtil {

  constructor () {
    this.uuid = 1;
    DNDUtil.remsize = 14;
    this.targetArmamentWrapper = null;
    this.targetArmamentWrapperMonitorClientOffset= null;
  }

  dropHandler (item, monitor, rest) {
    const {
      comContainerRef,
      componentsConfig,
      dispatchComponentsConfig,
      dispatchSelectedComponent,
      dispatchClearPropsState,
      dispatchModal,
      dropLocation,
      armory,
      dispatchLevels,
      userDetails,
      socket,
      logger
    } = rest;
    // Check if component is dropped on component container, OR if not, whether the a parent component is dropped on child item
    // In either case allow processing this dropped item
    logger({timestamp: new Date(), log: `Dropped component: ${item.category.displayName}`})
    const handleChildArmamentWrapperDropForInverseDropScenario = this.targetArmamentWrapper && this.isDroppedItemParentOfMonitor(item.category, this.targetArmamentWrapper);
    let clientOffset;
    if (handleChildArmamentWrapperDropForInverseDropScenario) {
      clientOffset = this.targetArmamentWrapperMonitorClientOffset;
    }
    if (monitor.isOver() || handleChildArmamentWrapperDropForInverseDropScenario){
      const rootChildrenArray = componentsConfig.components[0].descriptor.children;
      const position = this.getPosition(comContainerRef, monitor, clientOffset, true);
      item.type = monitor.getItemType();
      if (rootChildrenArray.length === 0) {
        // if (item.category && item.category.descriptor && item.category.descriptor.allowChildren) {
          this.updatePositionDescriptor(item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket);
        // } else {
        //   dispatchModal({display: true, meta: {title: "Add Container?", primaryButtonText: "Add", secondaryButtonText: "Cancel",
        //     body: "Clicking on add will wrap your component with a container, cancel to just view/fork/edit the component",
        //     primaryHandler: () => this.wrapAndUpdate(item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, armory, socket),
        //     secondaryHandler: () => this.updatePositionDescriptor(item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket)}});
        // }
      } else {
        if (item.category.uuid) {
          this.updatePositionDescriptor(item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket);
        } else {
          dispatchModal({display: true, meta: {
            title: "Invalid Action",
            primaryButtonText: "Wrap",
            secondaryButtonText: "Cancel",
            body: <div className="font-size-12">
                <span>You cannot add more than one atomic component on this board!</span>
                <span>If you intend to work with multiple components please use "Create Page" option on the dashboard.</span>
                <p>You can also wrap the new component alongwith existing component in a new Container.</p>
                <span>Click "Cancel" to cancel this drop or "Wrap" to add another container.</span>
              </div>,
            primaryHandler: () => this.wrapAllAndUpdate(item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, armory, socket),
            secondaryHandler: undefined,
            bodyType: "jsx"
          }});
        }
      }
      this.targetArmamentWrapper = null;
      this.targetArmamentWrapperMonitorClientOffset = null;
    }
  }

  wrapAllAndUpdate (item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, armory, socket) {
    const [left, top] = position;
    const componentsConfigClone = {...componentsConfig};
    let rootChildrenArray = componentsConfigClone.components[0].descriptor.children;
    // Add dropped Item
    item.category = JSON.parse(JSON.stringify(item.category));
    componentsConfigClone.count = componentsConfigClone.count + 1;
    item.category.uuid = `arm-${item.category.name}-${uuid()}`;
    const droppedComponentConfig = {...item.category, name: item.category.name, index: componentsConfigClone.count, top, left}
    rootChildrenArray.push(droppedComponentConfig);
    
    // Add Container
    let {selectedComponentConfig: container} = Helper.searchInTree("name", "Container", armory, "", "items.descriptor", 1)
    container = JSON.parse(JSON.stringify(container));
    componentsConfigClone.count = componentsConfigClone.count + 1;
    container.uuid = `arm-${container.name}-${uuid()}`;
    const {leftMin, topMin, width, height} = this.findExtremes(rootChildrenArray);

    container.descriptor.children = [];
    container.descriptor.styles = container.descriptor.styles ?
      {
        ...container.descriptor.styles,
        height: (Math.floor(height/DNDUtil.remsize) + 2) + "rem",
        width: (Math.floor(width/DNDUtil.remsize) + 2) + "rem"
      }
      : {
        height: (Math.floor(height/DNDUtil.remsize) + 2) + "rem",
        width: (Math.floor(width/DNDUtil.remsize) + 2) + "rem"
      }
    const containerComponentConfig = {name: container.name, index: componentsConfigClone.count, top: topMin - DNDUtil.remsize, left: leftMin - DNDUtil.remsize, ...container}
    container.descriptor.children = container.descriptor.children.concat(rootChildrenArray);
    componentsConfigClone.components[0].descriptor.children = [];
    componentsConfigClone.components[0].descriptor.children.push(containerComponentConfig);
    this.normalizePositionsWithContainer(container.descriptor.children, topMin, leftMin);
    dispatchComponentsConfig(componentsConfigClone);
    socket.emit("message", componentsConfigClone)
    dispatchSelectedComponent(item.category.uuid)
    dispatchClearPropsState(true);
  }

  wrapAndUpdate (item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, armory, socket) {
    const [left, top] = position;
    const componentsConfigClone = {...componentsConfig};
    const rootChildrenArray = componentsConfigClone.components[0].descriptor.children;
    
    // Add Container
    let {selectedComponentConfig: container} = Helper.searchInTree("name", "Container", armory, "", "items.descriptor", 1)
    container = JSON.parse(JSON.stringify(container));
    componentsConfigClone.count = componentsConfigClone.count + 1;
    container.uuid = `arm-${container.name}-${uuid()}`;
    const containerComponentConfig = {name: container.name, index: componentsConfigClone.count, top, left, ...container}
    rootChildrenArray.push(containerComponentConfig);
    
    // Add Item in Container
    item.category = JSON.parse(JSON.stringify(item.category));
    componentsConfigClone.count = componentsConfigClone.count + 1;
    item.category.uuid = `arm-${item.category.name}-${uuid()}`;
    container.descriptor.children = container.descriptor.children ? [...container.descriptor.children] : [];
    const droppedComponentConfig = {...item.category, name: item.category.name, index: componentsConfigClone.count, top: 0, left: 0}
    container.descriptor.children.push(droppedComponentConfig);

    dispatchComponentsConfig(componentsConfigClone);
    socket.emit("message", componentsConfigClone)
    dispatchSelectedComponent(item.category.uuid)
    dispatchClearPropsState(true);
  }

  updatePositionDescriptor (item, position, componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket) {
    const componentsConfigClone = {...componentsConfig};
    const rootChildrenArray = componentsConfigClone.components[0].descriptor.children;
    const [left, top] = position;

    if (item.type === ITEM_TYPE.ARMAMENT) {
      componentsConfigClone.count = componentsConfigClone.count + 1;
      item.category.uuid = `arm-${item.category.name}-${uuid()}`;
      let droppedComponentConfig = {...item.category, name: item.category.name, index: componentsConfigClone.count, top, left}
      // clone dropped item here
      droppedComponentConfig && (droppedComponentConfig = JSON.parse(JSON.stringify(droppedComponentConfig)));
      rootChildrenArray.push(JSON.parse(JSON.stringify(droppedComponentConfig)));
    } else {
      const {parent: droppedComponentParent, selectedComponentConfig: droppedComponentConfig} = Helper.searchInTree("uuid", item.category.uuid, componentsConfigClone, "components", "descriptor.children") || {};
      item.category.top = top;
      item.category.left = left;
      droppedComponentParent && droppedComponentParent.splice(droppedComponentParent.indexOf(droppedComponentConfig), 1)
      droppedComponentConfig && rootChildrenArray.push(droppedComponentConfig);
    }
    dispatchComponentsConfig(componentsConfigClone);
    socket && socket.emit("message", componentsConfigClone)
    dispatchSelectedComponent(item.category.uuid)
    dispatchClearPropsState(true);
  }

  armWrapperDropHandler (item, monitor, comContainerRef, ref, componentsConfig, droppedOn, setComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState, socket) {
    const isDroppedItemParentOfMonitor = this.isDroppedItemParentOfMonitor(item.category, droppedOn);
    item.type = monitor.getItemType();
    if (isDroppedItemParentOfMonitor) {
      this.targetArmamentWrapper = droppedOn; // Use this value in component container drop handler to set position of dropped container (only applicable to container type elements)
      this.targetArmamentWrapperMonitorClientOffset = monitor.getClientOffset();
    }
    if (monitor.isOver() && !isDroppedItemParentOfMonitor){
      if (item.category.uuid === droppedOn.uuid) {
        const position = this.getPosition(comContainerRef, monitor, null, true);
        this.updatePositionDescriptor(item, position, componentsConfig, setComponentsConfig, dispatchSelectedComponent, dispatchClearPropsState);
      } else if (droppedOn.descriptor.allowChildren) {
        const componentsConfigClone = {...componentsConfig};
        const {selectedComponentConfig: wrapper} = Helper.searchInTree("uuid", droppedOn.uuid, componentsConfigClone, "components", "descriptor.children");
        const wrapperChildrenArray = wrapper && wrapper.descriptor.children;
        const [left, top] = this.getPosition(ref, monitor);

        if (item.type === ITEM_TYPE.ARMAMENT) {
          componentsConfigClone.count = componentsConfigClone.count + 1;
          item.category.uuid = `arm-${item.category.name}-${uuid()}`;
          let droppedComponentConfig = {...item.category, name: item.category.name, index: componentsConfigClone.count, top, left}
          // clone dropped item here
          droppedComponentConfig && (droppedComponentConfig = JSON.parse(JSON.stringify(droppedComponentConfig)));
          wrapperChildrenArray.push(droppedComponentConfig);
        } else {
          const {parent: droppedComponentParent, selectedComponentConfig: droppedComponentConfig} = Helper.searchInTree("uuid", item.category.uuid, componentsConfigClone, "components", "descriptor.children");
          item.category.top = top;
          item.category.left = left;
          droppedComponentParent && droppedComponentParent.splice(droppedComponentParent.indexOf(droppedComponentConfig), 1)
          wrapperChildrenArray.push(droppedComponentConfig);
        }
        socket && socket.emit("message", componentsConfigClone)
        setComponentsConfig(componentsConfigClone);
        dispatchSelectedComponent(item.category.uuid)
        dispatchClearPropsState(true);
      }
    }
  }

  findExtremes (rootChildrenArray) {
    const left = rootChildrenArray.reduce((a, b) => Math.min(a, b.left), 10000000)
    const top = rootChildrenArray.reduce((a, b) => Math.min(a, b.top), 10000000)
    const maxTop = rootChildrenArray.reduce((a, b) => {
      const bHeighProp = b.descriptor && b.descriptor.styles && b.descriptor.styles.height ? b.descriptor.styles.height : b.defaultHeight ? b.defaultHeight : "15rem";
      const bHeight = bHeighProp.endsWith("rem") ? Number(bHeighProp.substring(0, bHeighProp.indexOf("rem"))) * DNDUtil.remsize : bHeighProp.endsWith("px") ? Number(bHeighProp.substring(0, bHeighProp.indexOf("px"))) : Number(bHeighProp);
      return Math.max(a, b.top + bHeight);
    }, 0);
    const maxLeft = rootChildrenArray.reduce((a, b) => {
      const bWidthProp = b.descriptor && b.descriptor.styles && b.descriptor.styles.width ? b.descriptor.styles.width : b.defaultWidth ? b.defaultWidth : "15rem";
      const bWidth = bWidthProp.endsWith("rem") ? Number(bWidthProp.substring(0, bWidthProp.indexOf("rem"))) * DNDUtil.remsize : bWidthProp.endsWith("px") ? Number(bWidthProp.substring(0, bWidthProp.indexOf("px"))) : Number(bWidthProp);
      return Math.max(a, b.left + bWidth);
    }, 0);
    return {leftMin: left, topMin: top, width: maxLeft - left, height: maxTop - top};
  }

  normalizePositionsWithContainer (array, top, left) {
    array && array.forEach(child => {
      child.left -= left;
      child.left += DNDUtil.remsize;
      child.top -= top;
      child.top += DNDUtil.remsize;
    })
  }

  getPosition (comContainerRef, monitor, incomingClientOffset, droppedOnPrimaryContainer) {
    let {left: containerLeft, top: containerTop} = comContainerRef.current.getBoundingClientRect();
    if (droppedOnPrimaryContainer) {
      containerLeft += DNDUtil.remsize;
      containerTop += DNDUtil.remsize;
    }
    const clientOffset = monitor.getItemType() === ITEM_TYPE.ARMAMENT_WRAPPER ? monitor.getSourceClientOffset() : monitor.getClientOffset() || incomingClientOffset;
    let {x, y} = clientOffset;
    let left = x - containerLeft;
    let top = y - containerTop;
    return true ? DNDUtil.snapToGrid(left, top, 30, true) : [left, top];
  }

  isDroppedItemParentOfMonitor(droppedItem, droppedOn) {
    if (!droppedItem || !droppedOn) {
      return false;
    }
    const droppedItemChildren = droppedItem && droppedItem.descriptor.children;
    if (!droppedItemChildren || droppedItemChildren.length === 0) {
      return false;
    }
    if (droppedItemChildren.find(item => item.uuid === droppedOn.uuid)) {
      return true;
    }
    return false;
  }

  dragHandler () {

  }

  collector (monitor) {
      return {isOver: !!monitor.isOver()}
  }

  static snapToGrid(x, y, layout, avoidPaddingCorrection) {
    layout = layout || 30;
    const snappedX = Math.floor(x / layout) * layout + (avoidPaddingCorrection ? 0 : DNDUtil.remsize) // Adjusting for container pdding
    const snappedY = Math.floor(y / layout) * layout + (avoidPaddingCorrection ? 0 : DNDUtil.remsize)
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
    // const clientRect = containingParentRef && containingParentRef.current && containingParentRef.current.getBoundingClientRect();
    // if (!clientRect) return false;
    const {left, top, width, height} = clientRect;
    const {x, y} = clientOffset;
    return x > left && x < left + width
      && y > top && y < top + height;
  }
  
}

export default new DNDUtil();