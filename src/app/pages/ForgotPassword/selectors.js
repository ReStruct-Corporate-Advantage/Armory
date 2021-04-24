import {createSelector} from 'reselect'
import {createGetSelector} from 'reselect-immutable-helpers'

const getData = ({data}) => data

export const getForgotPassword = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.forgotPassword
    }
)

export const getFormErrors = createGetSelector(getForgotPassword, 'formErrors')
export const getFormValues = createGetSelector(getForgotPassword, 'formValues')