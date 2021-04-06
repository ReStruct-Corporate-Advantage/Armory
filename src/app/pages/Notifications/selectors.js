import {createSelector} from "reselect"
import {createGetSelector} from "reselect-immutable-helpers"

const getData = ({data}) => data

export const getNotifications = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.notifications
    }
)

export const getFormErrors = createGetSelector(getNotifications, "formErrors")
export const getFormValues = createGetSelector(getNotifications, "formValues")