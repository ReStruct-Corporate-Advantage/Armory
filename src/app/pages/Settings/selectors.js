import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getSettings = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.settings
    }
)

export const getFormErrors = createGetSelector(getSettings, "formErrors")
export const getFormValues = createGetSelector(getSettings, "formValues")