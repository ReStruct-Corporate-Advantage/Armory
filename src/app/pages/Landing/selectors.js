import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getLanding = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.landing
    }
)

export const getFormErrors = createGetSelector(getLanding, "formErrors")
export const getFormValues = createGetSelector(getLanding, "formValues")