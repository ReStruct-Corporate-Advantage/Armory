import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getCategoryManager = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.categoryManager
    }
)

export const getFormErrors = createGetSelector(getCategoryManager, "formErrors")
export const getFormValues = createGetSelector(getCategoryManager, "formValues")