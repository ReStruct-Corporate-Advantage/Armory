import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getDashboard = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.dashboard
    }
)

export const getFormErrors = createGetSelector(getDashboard, "formErrors")
export const getFormValues = createGetSelector(getDashboard, "formValues")