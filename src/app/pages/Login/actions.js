export const UPDATE_FORM_VALUES = "UPDATE_LOGIN_FORM_VALUES"
export const UPDATE_FORM_ERRORS = "UPDATE_LOGIN_FORM_ERRORS"
export const SET_LOGGED_IN = "SET_LOGGED_IN";
export const SET_USER_ROLE= "SET_USER_ROLE";

export const updateFormValues = (formValues) => {
    return {
        type: UPDATE_FORM_VALUES,
        payload: formValues
    }
}

export const updateFormErrors = (formErrors) => {
    return {
        type: UPDATE_FORM_ERRORS,
        payload: formErrors
    }
}

export const setLoggedIn = (isLoggedIn) => {
    return {
        type: SET_LOGGED_IN,
        payload: {isLoggedIn}
    }
}

export const setUserRole = (userRole) => {
    return {
        type: SET_USER_ROLE,
        payload: {userRole}
    }
}