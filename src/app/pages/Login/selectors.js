import {createSelector} from 'reselect'
import {createGetSelector} from 'reselect-immutable-helpers'

const getData = ({data}) => data

export const getLogin = createSelector(
    getData,
    (dataState) => {
        return dataState.pages.login
    }
)

export const getFormErrors = createGetSelector(getLogin, 'formErrors')
export const getFormValues = createGetSelector(getLogin, 'formValues')