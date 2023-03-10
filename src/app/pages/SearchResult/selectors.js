import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getSearchResult = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.searchResult
    }
)

export const getFormErrors = createGetSelector(getSearchResult, "formErrors")
export const getFormValues = createGetSelector(getSearchResult, "formValues")