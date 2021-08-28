import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getHelp = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.help
    }
)

export const getFormErrors = createGetSelector(getHelp, "formErrors")
export const getFormValues = createGetSelector(getHelp, "formValues")