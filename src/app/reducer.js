import Immutable from "immutable"
import {combineReducers} from "redux"
import { DISPATCH_LEVELS, DISPATCH_MODAL, DISPATCH_USER_DETAILS, IS_MOBILE, SET_LOGGED_IN } from "./global-actions"
import adminComponentManagerReducer from "./pages/AdminComponentManager/reducer"
import componentCreatorReducer from "./pages/ComponentCreator/reducer"
import componentSelectorReducer from "./pages/ComponentSelector/reducer"

const initialState = Immutable.Map({modal: {meta: {}}})

const globalReducer = (state = initialState, action) => {
    switch (action.type) {
        case DISPATCH_USER_DETAILS:
        case SET_LOGGED_IN:
        case IS_MOBILE:
        case DISPATCH_LEVELS:
        case DISPATCH_MODAL:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default combineReducers({
    data: combineReducers({
        global: globalReducer,
        pages: combineReducers({
            componentCreator: componentCreatorReducer,
            componentSelector: componentSelectorReducer,
            adminComponentManager: adminComponentManagerReducer
        })
    })
})
