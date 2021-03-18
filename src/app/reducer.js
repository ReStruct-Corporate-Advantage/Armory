import {combineReducers} from "redux"
import homeReducer from "./pages/Home/reducer"
import componentCreatorReducer from "./pages/ComponentCreator/reducer"
import componentSelectorReducer from "./pages/ComponentSelector/reducer"

export default combineReducers({
    data: combineReducers({
        pages: combineReducers({
            home: homeReducer,
            componentCreator: componentCreatorReducer,
            componentSelector: componentSelectorReducer
        })
    })
})
