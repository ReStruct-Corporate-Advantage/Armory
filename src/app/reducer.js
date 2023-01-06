import Immutable from "immutable"
import {combineReducers} from "redux"
import { DISPATCH_CONTENT, DISPATCH_HIDE_QUICKOPTIONS, DISPATCH_LEVELS, DISPATCH_LOGS, DISPATCH_MODAL, DISPATCH_NOTIFICATION, DISPATCH_TOGGLES, DISPATCH_TOOLTIP,
    DISPATCH_USER_DETAILS, DISPATCH_ZOOM, IS_MOBILE, SET_LOGGED_IN, TOGGLE_LOADER } from "./global-actions"
import adminComponentManagerReducer from "./pages/AdminComponentManager/reducer"
import componentCreatorReducer from "./pages/ComponentCreator/reducer"
import pageCreatorReducer from "./pages/PageCreator/reducer"
import componentSelectorReducer from "./pages/ComponentSelector/reducer"

const initialState = Immutable.fromJS(
    {
        modal: {meta: {}}, content: {icons: {}},
        tooltip: {show: false},
        toggles: [],
        logs: []
    })

const globalReducer = (state = initialState, action) => {
    switch (action.type) {
        case DISPATCH_CONTENT:
        case DISPATCH_HIDE_QUICKOPTIONS:
        case DISPATCH_LEVELS:
        case DISPATCH_LOGS:
        case DISPATCH_MODAL:
        case DISPATCH_NOTIFICATION:
        case DISPATCH_TOGGLES:
        case DISPATCH_TOOLTIP:
        case DISPATCH_USER_DETAILS:
        case DISPATCH_ZOOM:
        case SET_LOGGED_IN:
        case TOGGLE_LOADER:
        case IS_MOBILE:
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
            pageCreator: pageCreatorReducer,
            componentSelector: componentSelectorReducer
        })
    })
})
