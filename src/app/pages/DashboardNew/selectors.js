import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getDashboardNew = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.dashboardNew
    }
)

export const getFormErrors = createGetSelector(getDashboardNew, "formErrors")
export const getFormValues = createGetSelector(getDashboardNew, "formValues")