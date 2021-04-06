import ITEM_TYPES from "../constants/types";

class DNDUtil {
    static dragHanlder (item, monitor, comContainerRef, componentsConfig, dispatchComponentsConfig) {
        let componentsConfigClone;
        const {left, top} = comContainerRef.current.getBoundingClientRect();
        const dropCoords = monitor.getClientOffset();
        componentsConfigClone = {...componentsConfig};
        const componentsClone = [...componentsConfigClone.components];
        componentsConfigClone.components = componentsClone;
        if (item.type === ITEM_TYPES.ARMAMENT) {
          componentsConfigClone.count = componentsConfigClone.count + 1;
          componentsClone.push({name: item.category.componentName, index: componentsConfigClone.count, top: dropCoords.y - top, left: dropCoords.x - left, definition: item.category})
        } else {
          componentsClone.splice(componentsClone.indexOf(item.category), 1)
          componentsClone.push({name: item.category.name, index: item.index, top: dropCoords.y - top, left: dropCoords.x - left})
        }
        dispatchComponentsConfig(componentsConfigClone);
        // if (id !== item.listId) {
        //   // pushCard(item.card);
        // }
        // return {listId: id}
    }

    dropHandler () {

    }

    static collector (monitor) {
        return {isOver: !!monitor.isOver()}
    }
}

export default DNDUtil;