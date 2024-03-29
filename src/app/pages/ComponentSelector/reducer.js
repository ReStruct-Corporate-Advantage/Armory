import Immutable from "immutable"
import {IS_MOBILE, UPDATE_FORM_ERRORS, UPDATE_FORM_VALUES} from "./actions"

const initialState = Immutable.Map()

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_MOBILE:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default reducer