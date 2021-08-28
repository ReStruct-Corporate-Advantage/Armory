import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getComponentImporter = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.componentImporter
    }
)

export const getFormErrors = createGetSelector(getComponentImporter, "formErrors")
export const getFormValues = createGetSelector(getComponentImporter, "formValues")