import Immutable from "immutable"
import {SET_LOGGED_IN, SET_USER_ROLE, UPDATE_FORM_ERRORS, UPDATE_FORM_VALUES} from "./actions"

const initialState = Immutable.Map()

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOGGED_IN:
        case SET_USER_ROLE:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default reducer