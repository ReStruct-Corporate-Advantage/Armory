import Immutable from "immutable"

import {
    DISPATCH_COMPONENT_CONFIG,
    SET_COMPONENT_CONFIG,
    UPDATE_FORM_ERRORS,
    UPDATE_FORM_VALUES
} from "./actions";

const initialState = Immutable.Map({
    componentConfig: {}
})

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
        case DISPATCH_COMPONENT_CONFIG:
            return state.mergeDeep(action.payload)
        case SET_COMPONENT_CONFIG:
            return state.set("componentConfig", action.payload);
        default:
            return state
    }
}

export default reducer