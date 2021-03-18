import Immutable from "immutable"
import {DISPATCH_LAYOUT, IS_MOBILE, DISPATCH_CARD_POSITION, UPDATE_FORM_ERRORS, UPDATE_FORM_VALUES, DISPATCH_PREVIOUS_LAYOUT} from "./actions"

const initialState = Immutable.Map({
    layout: 30
})

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_MOBILE:
        case DISPATCH_CARD_POSITION:
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