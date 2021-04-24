import {createSelector} from 'reselect'
import {createGetSelector} from 'reselect-immutable-helpers'

const getData = ({data}) => data

export const getUserProfile = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.userProfile
    }
)

export const getFormErrors = createGetSelector(getUserProfile, 'formErrors')
export const getFormValues = createGetSelector(getUserProfile, 'formValues')