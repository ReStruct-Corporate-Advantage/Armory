/**
* TODO Add windows handling
*/
// import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {setComponentsConfig} from "./../pages/ComponentCreator/actions";
import ACTIONS from "../constants/actions";
import {forkedRepository} from "./../utils/CodeUtils/ComponentGenerator";
import Helper from "./Helper";

const useEventHandler = (props) => {
// constructor () {
    //     ctrlKeyPressed = false;
    // }
    const dispatch = useDispatch()
    // const componentsConfig = useSelector(state => state.data.pages.componentCreator.present.componentConfig);
    // const updateComponentConfig = useCallback((componentConfigCloned) => dispatch(dispatchComponentsConfig(componentConfigCloned)), [dispatch])
    const handleKeyDown = (event, componentConfig, dispatchComponentsConfig, selectedComponent, dispatchSelectedComponent, clientRect) => {
        // if (event.metaKey) {
        //     ctrlKeyPressed = true;
        // }
        const action = getAction(event);
        processAction(action, componentConfig, dispatchComponentsConfig, selectedComponent, dispatchSelectedComponent, clientRect, event);
    }

    const handleOnClick = (e) => {
        if (e.metaKey) {
            processAction(ACTIONS.SELECTMANY);
        }
    }

    const handleKeyUp = () => {
        // const ctrlKeyPressed = false;
    }

    const getAction = (event) => {
        if (event.metaKey && event.keyCode === 90) {
            return ACTIONS.UNDO;
        } else if ((event.metaKey && event.keyCode === 89) || (event.metaKey && event.shiftKey && event.keyCode === 16)) {
            return ACTIONS.REDO
        } else if (event.metaKey && event.keyCode === 65) {
            return ACTIONS.SELECTALL;
        } else if (event.code === "Backspace") {
            return ACTIONS.DELETE
        } else if (event.keyCode === 37) {
            return ACTIONS.LEFT
        } else if (event.keyCode === 38) {
            return ACTIONS.UP
        } else if (event.keyCode === 39) {
            return ACTIONS.RIGHT
        } else if (event.keyCode === 40) {
            return ACTIONS.DOWN
        }
    }

    const processAction = (action, componentConfig, dispatchComponentsConfig, selectedComponent, dispatchSelectedComponent, clientRect, event) => {
        switch (action) {
            case ACTIONS.DELETE:
                deleteItem(componentConfig, selectedComponent, dispatchSelectedComponent, event);
                break;
            case ACTIONS.REDO:
                processRedo(componentConfig, event);
                break;
            case ACTIONS.SELECTMANY:
                selectMultiple(componentConfig, event);
                break;
            case ACTIONS.SELECTALL:
                selectAll(componentConfig, event);
                break;
            case ACTIONS.UNDO:
                processUndo(componentConfig, event);
                break;
            case ACTIONS.LEFT:
            case ACTIONS.UP:
            case ACTIONS.RIGHT:
            case ACTIONS.DOWN:
                processMove(componentConfig, dispatchComponentsConfig, selectedComponent, clientRect, action, event);
                break;
            default:
                break;
        }
    }

    const processUndo = (componentConfig, event) => {
        console.log("ctrl + z")
    }

    const processRedo = (componentConfig, event) => {
        console.log("ctrl + y or ctrl + shift + z")
    }

    const selectMultiple = (componentConfig, event) => {
        console.log("selecting multiple")
    }

    const selectAll = (componentConfig, event) => {
        console.log("selecting all")
    }

    const deleteItem = (componentConfig, selectedComponent, dispatchSelectedComponent, event) => {
        if (event.target.nodeName !== "INPUT") {
            const componentConfigCloned = {...componentConfig};
            const childArray = componentConfigCloned.components[0].descriptor.children;
            const searchedObj = Helper.searchInTree("uuid", selectedComponent, componentConfigCloned, "components", "descriptor.children");
            if (searchedObj) {
                const {parent} = searchedObj;
                parent.splice(parent.findIndex(item => item.uuid === selectedComponent), 1);
                props.socket && props.socket.emit("message", componentConfigCloned)
                dispatch(setComponentsConfig(componentConfigCloned));
                delete forkedRepository[selectedComponent]
                childArray && childArray.length > 0 && dispatchSelectedComponent(childArray[childArray.length - 1].uuid)
            }
        }
    }

    const processMove = (componentConfig, dispatchComponentsConfig, selectedComponent, clientRect, action, event) => {
        const componentConfigCloned = {...componentConfig};
        const searchedObj = Helper.searchInTree("uuid", selectedComponent, componentConfigCloned, "components", "descriptor.children");
        if (searchedObj) {
            let {parent, selectedComponentConfig} = searchedObj;
            selectedComponentConfig = {...selectedComponentConfig};
            parent.splice(parent.findIndex(item => item.uuid === selectedComponent), 1, selectedComponentConfig);
            let triggerAction = false;
            switch (action) {
                case ACTIONS.LEFT:
                    if (selectedComponentConfig.left > 0) {
                        selectedComponentConfig.left -= 1;
                        triggerAction = true;
                    }
                    break;
                case ACTIONS.UP:
                    if (selectedComponentConfig.top > 0) {
                        selectedComponentConfig.top -= 1;
                        triggerAction = true;
                    }
                    break;
                case ACTIONS.RIGHT:
                    if (selectedComponentConfig.left < clientRect.width) {
                        selectedComponentConfig.left += 1;
                        triggerAction = true;
                    }
                    break;
                case ACTIONS.DOWN:
                    if (selectedComponentConfig.top < clientRect.height) {
                        selectedComponentConfig.top += 1;
                        triggerAction = true;
                    }
                    break;
                default:
                    break;
            }
            if (triggerAction) {
                props.socket.emit("message", componentConfigCloned);
                dispatchComponentsConfig(componentConfigCloned);
            }
        }
    }

    const getComponentWidthAndHeight = component => {
        const compStyles = component.descriptor.styles;
        // const width = compStyles ? compStyles.width ? compStyles.width.endsWith("rem")
    }
    
    const registerListener = (element) => {
        element.addEventListener( "contextmenu", function(e) {
//             console.log(e, element);
            e.preventDefault();
        })
    };

    return {handleKeyDown, handleKeyUp, handleOnClick, registerListener}
}

export default useEventHandler;