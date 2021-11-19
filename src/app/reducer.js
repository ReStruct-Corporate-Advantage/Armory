import Immutable from "immutable"
import {combineReducers} from "redux"
import { DISPATCH_CONTENT, DISPATCH_LEVELS, DISPATCH_MODAL, DISPATCH_USER_DETAILS, IS_MOBILE, SET_LOGGED_IN } from "./global-actions"
import adminComponentManagerReducer from "./pages/AdminComponentManager/reducer"
import componentCreatorReducer from "./pages/ComponentCreator/reducer"
import componentSelectorReducer from "./pages/ComponentSelector/reducer"

const initialState = Immutable.Map({modal: {meta: {}}, content: {icons: {}}})

const globalReducer = (state = initialState, action) => {
    switch (action.type) {
        case DISPATCH_USER_DETAILS:
        case SET_LOGGED_IN:
        case IS_MOBILE:
        case DISPATCH_LEVELS:
        case DISPATCH_MODAL:
        case DISPATCH_CONTENT:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default combineReducers({
    data: combineReducers({
        global: globalReducer,
        pages: combineReducers({
            adminComponentManager: adminComponentManagerReducer,
            componentCreator: componentCreatorReducer,
            componentSelector: componentSelectorReducer
        })
    })
})
