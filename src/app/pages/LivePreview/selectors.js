import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getLivePreview = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.livePreview
    }
)

export const getFormErrors = createGetSelector(getLivePreview, "formErrors")
export const getFormValues = createGetSelector(getLivePreview, "formValues")