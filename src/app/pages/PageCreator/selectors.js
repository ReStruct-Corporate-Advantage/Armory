import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getPageCreator = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.pageCreator
    }
)

export const getFormErrors = createGetSelector(getPageCreator, "formErrors")
export const getFormValues = createGetSelector(getPageCreator, "formValues")