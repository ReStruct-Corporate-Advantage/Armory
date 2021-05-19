import Immutable from "immutable"
import {combineReducers} from "redux"
import { IS_MOBILE } from "./global-actions"
import componentCreatorReducer from "./pages/ComponentCreator/reducer"
import componentSelectorReducer from "./pages/ComponentSelector/reducer"

const initialState = Immutable.Map({modal: {meta: {}}})

const globalReducer = (state = initialState, action) => {
    switch (action.type) {
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
            componentCreator: componentCreatorReducer,
            componentSelector: componentSelectorReducer
        })
    })
})
