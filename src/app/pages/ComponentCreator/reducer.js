import Immutable from "immutable"
import {DISPATCH_CARD_POSITION, DISPATCH_COMPONENT_CONFIG, DISPATCH_LAYOUT, DISPATCH_PREVIOUS_LAYOUT, IS_MOBILE, UPDATE_FORM_ERRORS, UPDATE_FORM_VALUES} from "./actions"

const initialState = Immutable.Map({
    componentConfig: {
        boardId: 1,
        count: 0,
        components: []
    }
})

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_MOBILE:
        case DISPATCH_CARD_POSITION:
        case DISPATCH_COMPONENT_CONFIG:
        case DISPATCH_LAYOUT:
        case DISPATCH_PREVIOUS_LAYOUT:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default reducer