import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getComponentSelector = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.componentSelector
    }
)

export const isMobile = createGetSelector(getComponentSelector, "isMobile")
export const getFormErrors = createGetSelector(getComponentSelector, "formErrors")
export const getFormValues = createGetSelector(getComponentSelector, "formValues")