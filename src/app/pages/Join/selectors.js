import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getJoin = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.join
    }
)

export const getFormErrors = createGetSelector(getJoin, "formErrors")
export const getFormValues = createGetSelector(getJoin, "formValues")