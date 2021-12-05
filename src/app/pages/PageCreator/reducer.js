import Immutable from "immutable"
import { ELEMENT_TYPE } from "../../constants/types";
import historyProvider from "../../utils/historyUtil";
import {
    DISPTACH_ARMORY,
    DISPTACH_CLEAR_PROPS_STATE,
    DISPATCH_PAGE_CONFIG,
    DISPATCH_HISTORY,
    DISPATCH_LAYOUT,
    DISPATCH_PREVIOUS_LAYOUT,
    DISPTACH_SELECTED_COMPONENT,
    DISPTACH_TOOL_ACTION_META,
    UPDATE_FORM_ERRORS,
    UPDATE_FORM_VALUES,
    SET_PAGE_CONFIG
} from "./actions";

const initialState = Immutable.Map({
    pageConfig: {
        componentConfig: {
            boardId: 1,
            count: 0,
            components: [
                {
                    name: "Root",
                    index: 1,
                    indent: 0,
                    descriptor: {
                        allowChildren: true,
                        defaultHeight: "100%",
                        defaultWidth: "100%",
                        displayName: "Root",
                        elemType: "div",
                        handlers: [],
                        id: "root",
                        type: ELEMENT_TYPE.PARENT,
                        children: []
                    }
                }
            ]
        },
        selectedComponent: "Root"
    }
})

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DISPTACH_ARMORY:
        case DISPTACH_CLEAR_PROPS_STATE:
        case DISPATCH_PAGE_CONFIG:
        case DISPATCH_HISTORY:
        case DISPATCH_LAYOUT:
        case DISPATCH_PREVIOUS_LAYOUT:
        case DISPTACH_SELECTED_COMPONENT:
        case DISPTACH_TOOL_ACTION_META:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload);
        case SET_PAGE_CONFIG:
            return state.set("pageConfig", action.payload);
        default:
            return state
    }
}

export default historyProvider(reducer);