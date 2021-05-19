import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getProjectCreator = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.projectCreator
    }
)

export const getFormErrors = createGetSelector(getProjectCreator, "formErrors")
export const getFormValues = createGetSelector(getProjectCreator, "formValues")