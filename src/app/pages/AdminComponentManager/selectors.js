import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getAdminComponentManager = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.adminComponentManager
    }
)

export const getFormErrors = createGetSelector(getAdminComponentManager, "formErrors")
export const getFormValues = createGetSelector(getAdminComponentManager, "formValues")
export const getComponentConfig = createGetSelector(getAdminComponentManager, "componentConfig")
