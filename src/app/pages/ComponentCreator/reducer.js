import Immutable from "immutable";
import { ELEMENT_TYPE } from "../../constants/types";
import historyProvider from "../../utils/historyUtil";
import {
    DISPATCH_CARD_POSITION,
    DISPATCH_COMPONENT_CONFIG,
    DISPATCH_HISTORY,
    DISPATCH_LAYOUT,
    DISPATCH_PREVIOUS_LAYOUT,
    IS_MOBILE,UPDATE_FORM_ERRORS,
    UPDATE_FORM_VALUES
} from "./actions";

const initialState = Immutable.Map({
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
    }
})

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_MOBILE:
        case DISPATCH_CARD_POSITION:
        case DISPATCH_COMPONENT_CONFIG:
        case DISPATCH_HISTORY:
        case DISPATCH_LAYOUT:
        case DISPATCH_PREVIOUS_LAYOUT:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default historyProvider(reducer);