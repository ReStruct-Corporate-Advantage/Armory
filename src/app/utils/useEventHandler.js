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
    const handleKeyDown = (event, componentConfig, selectedComponent, setSelectedComponent) => {
        // if (event.metaKey) {
        //     ctrlKeyPressed = true;
        // }
        const action = getAction(event);
        processAction(action, componentConfig, selectedComponent, setSelectedComponent, event);
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
        }
    }

    const processAction = (action, componentConfig, selectedComponent, setSelectedComponent, event) => {
        switch (action) {
            case ACTIONS.DELETE:
                deleteItem(componentConfig, selectedComponent, setSelectedComponent, event);
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

    const deleteItem = (componentConfig, selectedComponent, setSelectedComponent, event) => {
        if (event.target.nodeName !== "INPUT") {
            const componentConfigCloned = {...componentConfig};
            const childArray = componentConfigCloned.components[0].descriptor.children;
            const searchedObj = Helper.searchInTree("uuid", selectedComponent, componentConfigCloned, "components", "descriptor.children");
            if (searchedObj) {
                const {parent} = searchedObj;
                parent.splice(parent.findIndex(item => item.uuid === selectedComponent), 1);
                dispatch(setComponentsConfig(componentConfigCloned));
                delete forkedRepository[selectedComponent]
                childArray && childArray.length > 0 && setSelectedComponent(childArray[childArray.length - 1].uuid)
            }
        }
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