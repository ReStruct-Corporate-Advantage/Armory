import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getComponentCreator = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.componentCreator
    }
)

export const isMobile = createGetSelector(getComponentCreator, "isMobile")
export const getFormErrors = createGetSelector(getComponentCreator, "formErrors")
export const getFormValues = createGetSelector(getComponentCreator, "formValues")
export const getLayout = createGetSelector(getComponentCreator, "layout")
export const getPreviousLayout = createGetSelector(getComponentCreator, "previousLayout")
export const getComponentsConfig = createGetSelector(getComponentCreator, "componentConfig")