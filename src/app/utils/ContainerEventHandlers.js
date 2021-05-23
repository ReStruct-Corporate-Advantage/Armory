/**
* TODO Add windows handling
*/
import ACTIONS from "../constants/actions";

export default class ContainerEventHandlers {

    // constructor () {
    //     ContainerEventHandlers.ctrlKeyPressed = false;
    // }

    static handleKeyDown (event, componentConfig) {
        // if (event.metaKey) {
        //     ContainerEventHandlers.ctrlKeyPressed = true;
        // }
        const action = ContainerEventHandlers.getAction(event);
        ContainerEventHandlers.processAction(action, componentConfig);
    }

    static handleOnClick (e) {
        if (e.metaKey) {
            ContainerEventHandlers.processAction(ACTIONS.SELECTMANY);
        }
    }

    // static handleKeyUp () {
    //     ContainerEventHandlers.ctrlKeyPressed = false;
    // }

    static getAction (event) {
        if (event.metaKey && event.keyCode === 90) {
            return ACTIONS.UNDO;
        } else if ((event.metaKey && event.keyCode === 89) || (event.metaKey && event.shiftKey && event.keyCode === 16)) {
            return ACTIONS.REDO
        } else if (event.metaKey && event.keyCode === 65) {
            return ACTIONS.SELECTALL;
        } 
    }

    static processAction (action, componentConfig) {
        switch (action) {
            case ACTIONS.UNDO:
                ContainerEventHandlers.processUndo(componentConfig);
                break;
            case ACTIONS.REDO:
                ContainerEventHandlers.processRedo(componentConfig);
                break;
            case ACTIONS.SELECTMANY:
                ContainerEventHandlers.selectMultiple(componentConfig);
                break;
            case ACTIONS.SELECTALL:
                ContainerEventHandlers.selectAll(componentConfig);
                break;
            default:
                break;
        }
    }

    static processUndo (componentConfig) {
        console.log("ctrl + z")
    }

    static processRedo (componentConfig) {
        console.log("ctrl + y or ctrl + shift + z")
    }

    static selectMultiple (componentConfig) {
        console.log("selecting multiple")
    }

    static selectAll (componentConfig) {
        console.log("selecting all")
    }
    
}