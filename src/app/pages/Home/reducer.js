import Immutable from 'immutable'
import {IS_MOBILE, DISPATCH_CARD_POSITION, UPDATE_FORM_ERRORS, UPDATE_FORM_VALUES} from './actions'

const initialState = Immutable.Map()

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_MOBILE:
        case DISPATCH_CARD_POSITION:
        case UPDATE_FORM_ERRORS:
        case UPDATE_FORM_VALUES:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export default reducer